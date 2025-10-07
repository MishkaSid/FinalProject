// Backend/middleware/auth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const cookieToken =
    (req.cookies && (req.cookies.accessToken || req.cookies.token)) || null;
  const token = bearer || cookieToken;

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    if (user && user.UserID && !user.id) user.id = user.UserID;
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const role = req.user.role || req.user.Role || null;
  const isAdminFlag = req.user.isAdmin === true || req.user.is_admin === true;
  const allowedRoles = ["Admin", "Manager", "Teacher"];
  const isAllowedRole = role && allowedRoles.includes(role);
  if (isAdminFlag || isAllowedRole) return next();
  return res.status(403).json({ error: "Admin access required" });
};

module.exports = { authenticateToken, requireAdmin };
