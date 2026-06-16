const ipRequests = new Map();


setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequests.entries()) {
    if (now > record.resetTime) {
      ipRequests.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();


function rateLimiter({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = "Too many requests from this IP, please try again later.",
} = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    let record = ipRequests.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        hits: 1,
        resetTime: now + windowMs,
      };
      ipRequests.set(ip, record);
    } else {
      record.hits += 1;
    }


    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.hits));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));

    if (record.hits > max) {
      return res.status(429).json({
        success: false,
        message,
      });
    }

    next();
  };
}

module.exports = rateLimiter;
