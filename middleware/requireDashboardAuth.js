const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function requireDashboardAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Missing or invalid Authorization header");
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // Attach user info to request if needed
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
}

module.exports = requireDashboardAuth;
