const crypto = require("crypto");


function sanitizeMessage(message) {
  if (!message) return "";

  return message

    .replace(/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/g, ":uuid")

    .replace(/[0-9a-fA-F]{24}/g, ":objectid")

    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, ":ip")

    .replace(/\b\d+\b/g, ":number")

    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, ":email")

    .replace(/\s+/g, " ")
    .trim();
}


function generateFingerprint(service, message, stackTrace = "") {
  const cleanMessage = sanitizeMessage(message);

  let normalizedStackTrace = "";
  if (typeof stackTrace === "string") {
    normalizedStackTrace = stackTrace;
  } else if (stackTrace && typeof stackTrace === "object") {
    try {
      normalizedStackTrace = JSON.stringify(stackTrace);
    } catch (e) {
      normalizedStackTrace = "";
    }
  }

  let traceContext = "";
  if (normalizedStackTrace) {
    const frames = normalizedStackTrace
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.startsWith("at ") && !line.includes("node_modules") && !line.includes("node:internal"));

    traceContext = frames.slice(0, 3).join("|");
  }


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
