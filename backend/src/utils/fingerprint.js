const crypto = require("crypto");

/**
 * Sanitizes variable parameters from log messages to prevent unique IDs/UUIDs
 * from creating separate fingerprints for the same error type.
 */
function sanitizeMessage(message) {
  if (!message) return "";
  
  return message
    // Mask UUIDs
    .replace(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g, ":uuid")
    // Mask Mongo ObjectIDs
    .replace(/[0-9a-fA-F]{24}/g, ":objectid")
    // Mask IP addresses
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, ":ip")
    // Mask Numeric IDs
    .replace(/\b\d+\b/g, ":number")
    // Mask email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, ":email")
    // Trim multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generates a deterministic SHA-256 fingerprint from service name,
 * sanitized error message, and first few files of the stack trace.
 */
function generateFingerprint(service, message, stackTrace = "") {
  const cleanMessage = sanitizeMessage(message);
  
  // Parse stack trace to extract top 3 non-node-modules frames for consistency
  let traceContext = "";
  if (stackTrace) {
    const frames = stackTrace
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.startsWith("at ") && !line.includes("node_modules") && !line.includes("node:internal"));
    
    // Use top 3 application-level stack frames
    traceContext = frames.slice(0, 3).join("|");
  }

  // Fallback to message components if stack trace is empty
  const rawFingerprintString = `${service.toLowerCase()}|${cleanMessage}|${traceContext}`;
  
  return crypto
    .createHash("sha256")
    .update(rawFingerprintString)
    .digest("hex");
}

module.exports = {
  sanitizeMessage,
  generateFingerprint,
};
