package httpapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func testVerifier(context.Context, string) (Identity, error) {
	return Identity{Issuer: "https://issuer.example.test", Subject: "test-subject"}, nil
}

func TestHealthIsPublicAndReportsLiveness(t *testing.T) {
	api := New(nil, nil)
	recorder := httptest.NewRecorder()
	api.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/healthz", nil))
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
	api.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/readyz", nil))
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
}

func TestProfileRequiresBearerToken(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	api.Handler().ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil))
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestProfileRejectsInvalidBearerToken(t *testing.T) {
	api := New(nil, func(context.Context, string) (Identity, error) {
		return Identity{}, context.Canceled
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil)
	request.Header.Set("Authorization", "Bearer invalid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestProfileRejectsIdentityWithoutIssuer(t *testing.T) {
	api := New(nil, func(context.Context, string) (Identity, error) {
		return Identity{Subject: "subject-only"}, nil
	})
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/v1/me/profile", nil)
	request.Header.Set("Authorization", "Bearer valid")
	request.Header.Set("Content-Type", "application/json")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsUnknownFields(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione","role":"admin"}`))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsMultipleJSONValues(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione"} {"admin":true}`))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsDisplayNameOverLimit(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	body := "{\"display_name\":\"" + strings.Repeat("x", 81) + "\"}"
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(body))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected 422, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsNonJSONContentType(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione"}`))
	request.Header.Set("Authorization", "Bearer valid")
	request.Header.Set("Content-Type", "text/plain")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnsupportedMediaType {
		t.Fatalf("expected 415, got %d", recorder.Code)
	}
}

func TestProfileWriteReturns413WhenBodyExceedsLimit(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	body := "{\\"display_name\\":\\"" + strings.Repeat("x", 5000) + "\\"}"
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(body))
	request.Header.Set("Authorization", "Bearer valid")
	request.Header.Set("Content-Type", "application/json")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d", recorder.Code)
	}
}

func TestProfileWriteRejectsMalformedJSON(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader("{invalid"))
	request.Header.Set("Authorization", "Bearer valid")
	request.Header.Set("Content-Type", "application/json")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestProfileWriteFailsClosedWhenDatabaseMissing(t *testing.T) {
	api := New(nil, testVerifier)
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodPut, "/v1/me/profile", strings.NewReader(`{"display_name":"Zavione"}`))
	request.Header.Set("Authorization", "Bearer valid")
	api.Handler().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
}
