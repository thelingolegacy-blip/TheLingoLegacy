package main

import (
	"context"
	"errors"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strings"
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
	parsed, err := url.Parse(databaseURL)
	if err != nil || !parsed.IsAbs() || parsed.Hostname() == "" {
		return errors.New("DATABASE_URL must be an absolute PostgreSQL URL with a hostname")
	}
	if parsed.Scheme != "postgres" && parsed.Scheme != "postgresql" {
		return errors.New("DATABASE_URL must use the postgres or postgresql URL scheme")
	}
	query, err := url.ParseQuery(parsed.RawQuery)
	if err != nil {
		return errors.New("DATABASE_URL contains an invalid query string")
	}
	sslModes := query["sslmode"]
	if len(sslModes) > 1 {
		return errors.New("DATABASE_URL must not contain duplicate sslmode parameters")
	}
	sslMode := ""
	if len(sslModes) == 1 {
		sslMode = sslModes[0]
	}

	host := strings.Trim(parsed.Hostname(), "[]")
	ip := net.ParseIP(host)
	loopback := host == "localhost" || (ip != nil && ip.IsLoopback())
	localDevelopment := appEnv == "development" || appEnv == "test"
	if localDevelopment && loopback && (sslMode == "disable" || sslMode == "verify-full") {
		return nil
	}
	if sslMode != "verify-full" {
		return errors.New("DATABASE_URL must set sslmode=verify-full; only loopback development/test databases may use sslmode=disable")
	}
	return nil
}

func validateOIDCIssuer(issuer, appEnv string) error {
	parsed, err := url.Parse(issuer)
	if err != nil || !parsed.IsAbs() || parsed.Hostname() == "" {
		return errors.New("OIDC_ISSUER_URL must be an absolute URL with a hostname")
	}
	if parsed.User != nil || parsed.RawQuery != "" || parsed.Fragment != "" {
		return errors.New("OIDC_ISSUER_URL must not contain user info, query parameters, or a fragment")
	}
	if parsed.Scheme == "https" {
		return nil
	}
	if parsed.Scheme == "http" && (appEnv == "development" || appEnv == "test") {
		host := parsed.Hostname()
		ip := net.ParseIP(host)
		if host == "localhost" || (ip != nil && ip.IsLoopback()) {
			return nil
		}
	}
	return errors.New("OIDC_ISSUER_URL must use HTTPS; HTTP is allowed only for loopback development/test issuers")
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
	if err := validateOIDCIssuer(issuer, os.Getenv("APP_ENV")); err != nil {
		log.Fatalf("unsafe OIDC issuer configuration: %v", err)
	}
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
