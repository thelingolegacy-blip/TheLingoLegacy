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
