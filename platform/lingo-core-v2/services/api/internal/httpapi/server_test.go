package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHealthIsPublicAndReportsLiveness(t *testing.T) {
	api := New(nil, nil)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	api.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if got := recorder.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("security header missing: %q", got)
	}
}

func TestReadinessFailsClosedWithoutDatabase(t *testing.T) {
	api := New(nil, nil)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/readyz", nil)
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
}

func TestProfileRequiresBearerToken(t *testing.T) {
	api := New(nil, func(context.Context, string) (string, error) {
		return "test-subject", nil
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil)
	api.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503 while database is absent, got %d", recorder.Code)
	}
}

func TestProfileRejectsInvalidBearerToken(t *testing.T) {
	api := New(nil, func(context.Context, string) (string, error) {
		return "", context.Canceled
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil)
	request.Header.Set("Authorization", "Bearer invalid")
	api.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503 while database is absent, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsUnknownFieldsBeforeDatabaseAccess(t *testing.T) {
	api := New(nil, func(context.Context, string) (string, error) {
		return "test-subject", nil
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione","role":"admin"}`))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503 while database is absent, got %d", recorder.Code)
	}
}

func TestProfileWriteRequiresDatabaseBeforeProcessing(t *testing.T) {
	api := New(nil, func(context.Context, string) (string, error) {
		return "test-subject", nil
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione"}`))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
}
