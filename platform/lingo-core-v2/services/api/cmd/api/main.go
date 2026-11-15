package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/thelingolegacy-blip/TheLingoLegacy/platform/lingo-core-v2/services/api/internal/httpapi"
)

func required(name string) string {
	value := os.Getenv(name)
	if value == "" {
		log.Fatalf("required environment variable %s is not set", name)
	}
	return value
}

func validateDatabaseTLS(databaseURL, appEnv string) error {
	if appEnv == "development" || appEnv == "test" {
		return nil
	}
	parsed, err := url.Parse(databaseURL)
	if err != nil {
		return errors.New("DATABASE_URL must be a valid PostgreSQL URL")
	}
	if parsed.Scheme != "postgres" && parsed.Scheme != "postgresql" {
		return errors.New("DATABASE_URL must use the postgres or postgresql URL scheme")
	}
	if parsed.Query().Get("sslmode") != "verify-full" {
		return errors.New("DATABASE_URL must set sslmode=verify-full outside development and test")
	}
	return nil
}

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	databaseURL := required("DATABASE_URL")
	if err := validateDatabaseTLS(databaseURL, os.Getenv("APP_ENV")); err != nil {
		log.Fatalf("unsafe PostgreSQL connection configuration: %v", err)
	}
	pool, err := pgxpool.New(ctx, databaseURL)
	if err != nil {
		log.Fatalf("configure PostgreSQL pool: %v", err)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("connect to PostgreSQL: %v", err)
	}

	issuer := required("OIDC_ISSUER_URL")
	clientID := required("OIDC_CLIENT_ID")
	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		log.Fatalf("discover OIDC issuer: %v", err)
	}
	verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

	verifySubject := func(ctx context.Context, rawToken string) (httpapi.Identity, error) {
		idToken, err := verifier.Verify(ctx, rawToken)
		if err != nil {
			return httpapi.Identity{}, err
		}
		if idToken.Subject == "" || idToken.Issuer == "" {
			return httpapi.Identity{}, errors.New("OIDC token has no issuer or subject")
		}
		return httpapi.Identity{Issuer: idToken.Issuer, Subject: idToken.Subject}, nil
	}

	api := httpapi.New(pool, verifySubject)
	addr := os.Getenv("HTTP_ADDR")
	if addr == "" {
		addr = ":8080"
	}
	server := &http.Server{
		Addr:              addr,
		Handler:           api.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1 MiB
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Printf("graceful shutdown: %v", err)
		}
	}()

	log.Printf("LINGO CORE V2 API listening on %s", addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("serve HTTP: %v", err)
	}
}
