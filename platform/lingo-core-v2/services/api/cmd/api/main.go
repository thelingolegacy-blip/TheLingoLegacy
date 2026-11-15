package main

import (
	"context"
	"errors"
	"log"
	"net/http"
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

func main() {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := pgxpool.New(ctx, required("DATABASE_URL"))
	if err != nil {
		log.Fatalf("configure PostgreSQL pool: %v", err)
	}
	defer pool.Close()

	issuer := required("OIDC_ISSUER_URL")
	clientID := required("OIDC_CLIENT_ID")
	provider, err := oidc.NewProvider(ctx, issuer)
	if err != nil {
		log.Fatalf("discover OIDC issuer: %v", err)
	}
	verifier := provider.Verifier(&oidc.Config{ClientID: clientID})

	verifySubject := func(ctx context.Context, rawToken string) (string, error) {
		idToken, err := verifier.Verify(ctx, rawToken)
		if err != nil {
			return "", err
		}
		if idToken.Subject == "" {
			return "", errors.New("OIDC token has no subject")
		}
		return idToken.Subject, nil
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
