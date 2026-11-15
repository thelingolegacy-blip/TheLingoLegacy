package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Identity struct {
	Issuer  string
	Subject string
}

type SubjectVerifier func(context.Context, string) (Identity, error)

type Profile struct {
	Issuer      string    `json:"-"`
	Subject     string    `json:"subject"`
	DisplayName string    `json:"display_name"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type API struct {
	db     *pgxpool.Pool
	verify SubjectVerifier
	mux    *http.ServeMux
}

func New(db *pgxpool.Pool, verify SubjectVerifier) *API {
	a := &API{db: db, verify: verify, mux: http.NewServeMux()}
	a.mux.HandleFunc("GET /healthz", a.health)
	a.mux.HandleFunc("GET /readyz", a.ready)
	a.mux.HandleFunc("GET /v1/me/profile", a.getProfile)
	a.mux.HandleFunc("PUT /v1/me/profile", a.putProfile)
	return a
}

func (a *API) Handler() http.Handler { return securityHeaders(a.mux) }

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func (a *API) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *API) ready(w http.ResponseWriter, r *http.Request) {
	if a.db == nil || a.db.Ping(r.Context()) != nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"status": "not_ready"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}

func (a *API) authenticatedIdentity(w http.ResponseWriter, r *http.Request) (Identity, bool) {
	if a.verify == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "identity_verifier_unavailable"})
		return Identity{}, false
	}
	parts := strings.Fields(r.Header.Get("Authorization"))
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "bearer_token_required"})
		return Identity{}, false
	}
	identity, err := a.verify(r.Context(), parts[1])
	if err != nil || strings.TrimSpace(identity.Issuer) == "" || strings.TrimSpace(identity.Subject) == "" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid_token"})
		return Identity{}, false
	}
	return identity, true
}

func (a *API) getProfile(w http.ResponseWriter, r *http.Request) {
	identity, ok := a.authenticatedIdentity(w, r)
	if !ok {
		return
	}
	if a.db == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database_unavailable"})
		return
	}
	var profile Profile
	err := a.db.QueryRow(r.Context(),
		"SELECT issuer, subject, display_name, updated_at FROM lingo_profiles WHERE issuer = $1 AND subject = $2",
		identity.Issuer, identity.Subject,
	).Scan(&profile.Issuer, &profile.Subject, &profile.DisplayName, &profile.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "profile_not_found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "profile_read_failed"})
		return
	}
	writeJSON(w, http.StatusOK, profile)
}

func (a *API) putProfile(w http.ResponseWriter, r *http.Request) {
	identity, ok := a.authenticatedIdentity(w, r)
	if !ok {
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	var input struct {
		DisplayName string `json:"display_name"`
	}
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_request"})
		return
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid_request"})
		return
	}
	input.DisplayName = strings.TrimSpace(input.DisplayName)
	if input.DisplayName == "" || len([]rune(input.DisplayName)) > 80 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"error": "display_name_must_be_1_to_80_characters"})
		return
	}
	if a.db == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]string{"error": "database_unavailable"})
		return
	}

	tx, err := a.db.Begin(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "profile_write_failed"})
		return
	}
	defer tx.Rollback(r.Context())

	var profile Profile
	err = tx.QueryRow(r.Context(), `
		INSERT INTO lingo_profiles (issuer, subject, display_name)
		VALUES ($1, $2, $3)
		ON CONFLICT (issuer, subject) DO UPDATE
		SET display_name = EXCLUDED.display_name, updated_at = now()
		RETURNING issuer, subject, display_name, updated_at
	`, identity.Issuer, identity.Subject, input.DisplayName).Scan(
		&profile.Issuer, &profile.Subject, &profile.DisplayName, &profile.UpdatedAt,
	)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "profile_write_failed"})
		return
	}
	payload, err := json.Marshal(map[string]string{
		"issuer": identity.Issuer, "subject": identity.Subject, "display_name": profile.DisplayName,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "event_encode_failed"})
		return
	}
	aggregateID := identity.Issuer + "|" + identity.Subject
	_, err = tx.Exec(r.Context(), `
		INSERT INTO lingo_outbox_events (aggregate_type, aggregate_id, event_type, schema_version, payload)
		VALUES ('profile', $1, 'profile.updated', 1, $2::jsonb)
	`, aggregateID, string(payload))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "event_enqueue_failed"})
		return
	}
	if err := tx.Commit(r.Context()); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "profile_commit_failed"})
		return
	}
	writeJSON(w, http.StatusOK, profile)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
