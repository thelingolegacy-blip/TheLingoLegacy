package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
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

func TestProfileRequiresBearerToken(t *testing.T) {
	api := New(nil, func(context.Context, string) (string, error) {
		return "test-subject", nil
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil)
	api.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
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

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}
