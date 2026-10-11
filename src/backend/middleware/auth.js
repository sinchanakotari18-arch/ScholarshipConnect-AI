const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "scholarshipconnect_jwt_secret_2026_secure_key";

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Authorization required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token", error: error.message });
  }
}

function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      User.findById(decoded.userId)
        .select("-password")
        .then((user) => {
          if (user) req.user = user;
          next();
        })
        .catch(() => next());
    } else {
      next();
    }
  } catch (e) {
    next();
  }
}

function adminOnly(req, res, next) {
  if (!req.user || (req.user.role !== "admin" && !req.user.isAdmin)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  adminOnly,
  JWT_SECRET,
};
