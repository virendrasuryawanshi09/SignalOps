const jwt = require("../utils/jwt");

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access_secret";


function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied: Missing or malformed authentication header",
    });
  }

  const token = authHeader.split(" ")[1];
  const payload = jwt.verify(token, ACCESS_SECRET);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Access denied: Invalid or expired access token",
    });
  }

  req.user = payload;
  next();
}


function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authorization check failed: User context not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden: Your role does not have permission to access this resource",
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
