package httpapi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

func integrationPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is not set; PostgreSQL integration test skipped")
	}
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("create test PostgreSQL pool: %v", err)
	}
	t.Cleanup(pool.Close)

	migration, err := os.ReadFile("../../migrations/0001_profiles_and_outbox.sql")
	if err != nil {
		t.Fatalf("read migration: %v", err)
	}
	conn, err := pool.Acquire(ctx)
	if err != nil {
		t.Fatalf("acquire migration connection: %v", err)
	}
	for _, statement := range strings.Split(string(migration), ";") {
		statement = strings.TrimSpace(statement)
		if statement == "" {
			continue
		}
		if _, err := conn.Exec(ctx, statement); err != nil {
			conn.Release()
			t.Fatalf("apply migration statement: %v", err)
		}
	}
	conn.Release()
	if _, err := pool.Exec(ctx, "TRUNCATE lingo_outbox_events, lingo_profiles"); err != nil {
		t.Fatalf("clear integration tables: %v", err)
	}
	return pool
}

func performProfileWrite(t *testing.T, api *API, displayName string) *httptest.ResponseRecorder {
	t.Helper()
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"`+displayName+`"}`))
	request.Header.Set("Authorization", "Bearer integration-test")
	api.Handler().ServeHTTP(recorder, request)
	return recorder
}

func TestPostgresProfileIsolationAndTransactionalOutbox(t *testing.T) {
	pool := integrationPool(t)
	identity := Identity{Issuer: "https://issuer-one.example.test", Subject: "same-subject"}
	api := New(pool, func(context.Context, string) (Identity, error) { return identity, nil })

	first := performProfileWrite(t, api, "First issuer profile")
	if first.Code != http.StatusOK {
		t.Fatalf("first profile write: expected 200, got %d: %s", first.Code, first.Body.String())
	}

	identity = Identity{Issuer: "https://issuer-two.example.test", Subject: "same-subject"}
	second := performProfileWrite(t, api, "Second issuer profile")
	if second.Code != http.StatusOK {
		t.Fatalf("second profile write: expected 200, got %d: %s", second.Code, second.Body.String())
	}

	var profiles int
	if err := pool.QueryRow(context.Background(), "SELECT count(*) FROM lingo_profiles WHERE subject = $1", "same-subject").Scan(&profiles); err != nil {
		t.Fatal(err)
	}
	if profiles != 2 {
		t.Fatalf("expected same subject from two issuers to produce two profiles, got %d", profiles)
	}

	var outbox int
	if err := pool.QueryRow(context.Background(), "SELECT count(*) FROM lingo_outbox_events WHERE event_type = 'profile.updated'").Scan(&outbox); err != nil {
		t.Fatal(err)
	}
	if outbox != 2 {
		t.Fatalf("expected two committed outbox events, got %d", outbox)
	}

	var issuer string
	if err := pool.QueryRow(context.Background(), "SELECT payload->>'issuer' FROM lingo_outbox_events ORDER BY occurred_at, id LIMIT 1").Scan(&issuer); err != nil {
		t.Fatal(err)
	}
	if issuer == "" {
		t.Fatal("outbox payload must retain the verified issuer")
	}

	var response Profile
	if err := json.Unmarshal(second.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if response.Issuer != "" {
		t.Fatal("issuer must not be exposed in the public profile response")
	}
}

func TestPostgresOutboxFailureRollsBackProfileWrite(t *testing.T) {
	pool := integrationPool(t)
	ctx := context.Background()
	_, err := pool.Exec(ctx, `
		CREATE OR REPLACE FUNCTION lingo_test_reject_outbox() RETURNS trigger AS $$
		BEGIN
			RAISE EXCEPTION 'forced outbox failure';
		END;
		$$ LANGUAGE plpgsql
	`)
	if err != nil {
		t.Fatalf("create test trigger function: %v", err)
	}
	_, err = pool.Exec(ctx, `
		CREATE TRIGGER lingo_test_reject_outbox
		BEFORE INSERT ON lingo_outbox_events
		FOR EACH ROW EXECUTE FUNCTION lingo_test_reject_outbox()
	`)
	if err != nil {
		t.Fatalf("create test trigger: %v", err)
	}
	t.Cleanup(func() {
		_, _ = pool.Exec(context.Background(), "DROP TRIGGER IF EXISTS lingo_test_reject_outbox ON lingo_outbox_events")
		_, _ = pool.Exec(context.Background(), "DROP FUNCTION IF EXISTS lingo_test_reject_outbox()")
	})

	api := New(pool, func(context.Context, string) (Identity, error) {
		return Identity{Issuer: "https://issuer.example.test", Subject: "rollback-subject"}, nil
	})
	recorder := performProfileWrite(t, api, "Must roll back")
	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("expected outbox failure to return 500, got %d", recorder.Code)
	}
	var count int
	if err := pool.QueryRow(ctx, "SELECT count(*) FROM lingo_profiles WHERE issuer = $1 AND subject = $2",
		"https://issuer.example.test", "rollback-subject").Scan(&count); err != nil {
		t.Fatal(err)
	}
	if count != 0 {
		t.Fatalf("profile row must roll back with failed outbox insert; found %d rows", count)
	}
}
