const jwt = require("../../src/utils/jwt");

describe("JWT Utility Unit Tests", () => {
  const secret = "my_super_secret_key";
  const payload = { id: "user_123", email: "test@example.com", role: "DEVELOPER" };

  test("should sign a token and encode payload correctly", () => {
    const token = jwt.sign(payload, secret, 3600);
    expect(token).toBeDefined();
    expect(token.split(".").length).toBe(3);
  });

  test("should verify and decode a valid token signature", () => {
    const token = jwt.sign(payload, secret, 3600);
    const decoded = jwt.verify(token, secret);
    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });

  test("should return null for expired tokens", () => {

    const token = jwt.sign(payload, secret, -10);
    const decoded = jwt.verify(token, secret);
    expect(decoded).toBeNull();
  });

  test("should return null for invalid signature secrets", () => {
    const token = jwt.sign(payload, secret, 3600);
    const decoded = jwt.verify(token, "wrong_secret_key");
    expect(decoded).toBeNull();
  });

  test("should return null for malformed tokens", () => {
    expect(jwt.verify("not.a.token", secret)).toBeNull();
    expect(jwt.verify(null, secret)).toBeNull();
    expect(jwt.verify("", secret)).toBeNull();
  });
});
