/**
 * Test-only JWT signing fixture for Wave 1B / issue #536.
 * Uses ephemeral RSA keys generated in-process. Never import production keys.
 * This is a signing fixture only; production verification must be tested
 * through the repository's actual verifier implementation.
 */
import {
  createSign,
  generateKeyPairSync,
} from "node:crypto";

export interface TestTokenClaims {
  iss: string;
  aud: string;
  sub: string;
  exp: number;
  iat: number;
  auth_time: number;
  [claim: string]: unknown;
}

export interface TestKeyMaterial {
  privateKeyPem: string;
  publicKeyPem: string;
  kid: string;
}

export function createTestKeys(kid = "test-kid-001"): TestKeyMaterial {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return {
    privateKeyPem: privateKey,
    publicKeyPem: publicKey,
    kid,
  };
}

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

export function createMockSignedJwt(
  claims: TestTokenClaims,
  keys: TestKeyMaterial,
): string {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: keys.kid,
  };
  const signingInput =
    `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(keys.privateKeyPem).toString("base64url");
  return `${signingInput}.${signature}`;
}

export function createDefaultTestClaims(
  overrides: Partial<TestTokenClaims> = {},
): TestTokenClaims {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: "https://securetoken.google.com/test-project-id",
    aud: "test-project-id",
    sub: "test-uid-1234567890",
    iat: now,
    exp: now + 3600,
    auth_time: now,
    ...overrides,
  };
}
