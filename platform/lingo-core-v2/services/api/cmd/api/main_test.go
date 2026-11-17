package main

import "testing"

func TestValidateDatabaseTLSRequiresVerifiedPostgresTLS(t *testing.T) {
	tests := []struct {
		name        string
		databaseURL string
		appEnv      string
		wantErr     bool
	}{
		{name: "verified TLS", databaseURL: "postgres://user:pass@db.example.test:5432/lingo?sslmode=verify-full", appEnv: "production", wantErr: false},
		{name: "require without hostname verification", databaseURL: "postgres://user:pass@db.example.test:5432/lingo?sslmode=require", appEnv: "production", wantErr: true},
		{name: "TLS disabled", databaseURL: "postgres://user:pass@localhost:5432/lingo?sslmode=disable", appEnv: "production", wantErr: true},
		{name: "development may use local database", databaseURL: "postgres://user:pass@localhost:5432/lingo?sslmode=disable", appEnv: "development", wantErr: false},
		{name: "test may use disposable database", databaseURL: "postgres://user:pass@localhost:5432/lingo?sslmode=disable", appEnv: "test", wantErr: false},
		{name: "wrong scheme", databaseURL: "https://db.example.test/lingo?sslmode=verify-full", appEnv: "production", wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateDatabaseTLS(test.databaseURL, test.appEnv)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateDatabaseTLS() error = %v, wantErr %v", err, test.wantErr)
			}
		})
	}
}

func TestValidateOIDCIssuerRequiresHTTPSOutsideLoopbackDevelopment(t *testing.T) {
	tests := []struct {
		name    string
		issuer  string
		appEnv  string
		wantErr bool
	}{
		{name: "production HTTPS issuer", issuer: "https://issuer.example.test", appEnv: "production", wantErr: false},
		{name: "production rejects HTTP", issuer: "http://issuer.example.test", appEnv: "production", wantErr: true},
		{name: "development loopback hostname", issuer: "http://localhost:8080", appEnv: "development", wantErr: false},
		{name: "test IPv4 loopback", issuer: "http://127.0.0.1:8080", appEnv: "test", wantErr: false},
		{name: "development rejects remote HTTP", issuer: "http://issuer.example.test", appEnv: "development", wantErr: true},
		{name: "development rejects non-loopback IP", issuer: "http://192.0.2.10", appEnv: "development", wantErr: true},
		{name: "reject credentials", issuer: "https://user:pass@issuer.example.test", appEnv: "production", wantErr: true},
		{name: "reject query string", issuer: "https://issuer.example.test?tenant=one", appEnv: "production", wantErr: true},
		{name: "reject relative URL", issuer: "/issuer", appEnv: "production", wantErr: true},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			err := validateOIDCIssuer(test.issuer, test.appEnv)
			if (err != nil) != test.wantErr {
				t.Fatalf("validateOIDCIssuer() error = %v, wantErr %v", err, test.wantErr)
			}
		})
	}
}
