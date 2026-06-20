const { sanitizeMessage, generateFingerprint } = require("../../src/utils/fingerprint");

describe("Fingerprint Utility Unit Tests", () => {
  describe("sanitizeMessage", () => {
    test("should mask UUIDs with ':uuid'", () => {
      const msg = "Failed to fetch user with id 123e4567-e89b-12d3-a456-426614174000";
      expect(sanitizeMessage(msg)).toBe("Failed to fetch user with id :uuid");
    });

    test("should mask Mongo ObjectIDs with ':objectid'", () => {
      const msg = "Resource 507f1f77bcf86cd799439011 not found";
      expect(sanitizeMessage(msg)).toBe("Resource :objectid not found");
    });

    test("should mask IP addresses with ':ip'", () => {
      const msg = "Connection timeout to 192.168.1.100 port 80";
      expect(sanitizeMessage(msg)).toBe("Connection timeout to :ip port :number");
    });

    test("should mask email addresses with ':email'", () => {
      const msg = "Account collision for dev.user_name@service.domain.org during login";
      expect(sanitizeMessage(msg)).toBe("Account collision for :email during login");
    });

    test("should normalize numeric sequences with ':number'", () => {
      const msg = "Query returned 1423 rows in 84 ms";
      expect(sanitizeMessage(msg)).toBe("Query returned :number rows in :number ms");
    });
  });

  describe("generateFingerprint", () => {
    const service = "User-Service";
    const msg = "TypeError: Cannot read properties of undefined (reading 'id')";
    const trace = `TypeError: Cannot read properties of undefined (reading 'id')
      at Object.getUserProfile (c:/project/src/modules/users/user.service.js:14:24)
      at async getUser (c:/project/src/modules/users/user.controller.js:8:20)
      at async Layer.handle [as handle_request] (c:/project/node_modules/express/lib/router/layer.js:95:5)`;

    test("should generate a consistent SHA-256 fingerprint based on inputs", () => {
      const fp1 = generateFingerprint(service, msg, trace);
      const fp2 = generateFingerprint(service, msg, trace);
      
      expect(fp1).toBeDefined();
      expect(fp1.length).toBe(64); 
      expect(fp1).toBe(fp2);
    });

    test("should ignore external node_modules frames during trace matching", () => {
      const fpWithModules = generateFingerprint(service, msg, trace);
      const traceWithoutModules = `TypeError: Cannot read properties of undefined (reading 'id')
        at Object.getUserProfile (c:/project/src/modules/users/user.service.js:14:24)
        at async getUser (c:/project/src/modules/users/user.controller.js:8:20)`;
        
      const fpWithoutModules = generateFingerprint(service, msg, traceWithoutModules);
      expect(fpWithModules).toBe(fpWithoutModules);
    });

    test("should safely process non-string stack trace inputs without throwing exceptions", () => {
      expect(() => generateFingerprint(service, msg, { mock: "object" })).not.toThrow();
      expect(() => generateFingerprint(service, msg, ["array", "frame"])).not.toThrow();
      expect(() => generateFingerprint(service, msg, null)).not.toThrow();
    });
  });
});
