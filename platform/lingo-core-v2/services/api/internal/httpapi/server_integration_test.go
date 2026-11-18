package httpapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5/pgxpool"
)

func validateIntegrationDatabaseURL(dsn string) error {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return err
	}
	host := strings.Trim(config.ConnConfig.Host, "[]")
	if !strings.EqualFold(host, "localhost") && host != "127.0.0.1" && host != "::1" {
		return fmt.Errorf("TEST_DATABASE_URL host must be loopback, got %q", host)
	}
	if config.ConnConfig.Database != "lingo_test" {
		return fmt.Errorf("TEST_DATABASE_URL database must be lingo_test, got %q", config.ConnConfig.Database)
	}
	return nil
}

func integrationPool(t *testing.T) *pgxpool.Pool {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL is not set; PostgreSQL integration test skipped")
	}
	if err := validateIntegrationDatabaseURL(dsn); err != nil {
		t.Fatalf("unsafe TEST_DATABASE_URL: %v", err)
	}
	ctx := context.Background()
	adminConfig, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		t.Fatalf("parse administrative test PostgreSQL configuration: %v", err)
	}
	adminPool, err := pgxpool.NewWithConfig(ctx, adminConfig)
	if err != nil {
		t.Fatalf("create administrative test PostgreSQL pool: %v", err)
	}
	t.Cleanup(adminPool.Close)

	// Each test receives a unique schema. Never migrate or truncate shared
	// application tables, even if TEST_DATABASE_URL is misconfigured.
	suffix := make([]byte, 8)
	if _, err := rand.Read(suffix); err != nil {
		t.Fatalf("generate isolated test schema name: %v", err)
	}
	schema := "lingo_test_" + hex.EncodeToString(suffix)
	if _, err := adminPool.Exec(ctx, "CREATE SCHEMA " + schema); err != nil {
		t.Fatalf("create isolated test schema: %v", err)
	}
	t.Cleanup(func() {
		if _, err := adminPool.Exec(context.Background(), "DROP SCHEMA IF EXISTS " + schema + " CASCADE"); err != nil {
			t.Errorf("drop isolated test schema: %v", err)
		}
	})

	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		t.Fatalf("parse test PostgreSQL configuration: %v", err)
	}
	config.ConnConfig.RuntimeParams["search_path"] = schema
	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		t.Fatalf("create isolated-schema PostgreSQL pool: %v", err)
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
	if response.Issuer != "" || response.Subject != "" {
		t.Fatal("issuer and stable subject must not be exposed in the public profile response")
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

func TestValidateIntegrationDatabaseURL(t *testing.T) {
	tests := []struct {
		name    string
		dsn     string
		wantErr bool
	}{
		{name: "approved loopback test database", dsn: "postgres://postgres:postgres@localhost:5432/lingo_test?sslmode=disable"},
		{name: "case-insensitive localhost test database", dsn: "postgres://postgres:postgres@LOCALHOST:5432/lingo_test?sslmode=disable"},
		{name: "IPv4 loopback test database", dsn: "postgres://postgres:postgres@127.0.0.1:5432/lingo_test?sslmode=disable"},
		{name: "IPv6 loopback test database", dsn: "postgres://postgres:postgres@[::1]:5432/lingo_test?sslmode=disable"},
		{name: "remote host rejected", dsn: "postgres://user:pass@db.example.test:5432/lingo_test?sslmode=disable", wantErr: true},
		{name: "production database name rejected", dsn: "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable", wantErr: true},
		{name: "malformed URL rejected", dsn: "not-a-postgres-url", wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateIntegrationDatabaseURL(tt.dsn)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validateIntegrationDatabaseURL() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
