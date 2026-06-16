import jwt from 'jsonwebtoken';

// 🔐 VERIFY TOKEN
export const verifyToken = (req, res, next) => {
  // ✅ check cookie first
  let token = req.cookies?.taskly_token;

  // ✅ fallback (optional: for Postman / testing)
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(" ")[1];
  }

  // ❌ no token
  if (!token) {
    console.log("❌ No token received");
    return next({ status: 401, message: 'Unauthorized: No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);

    console.log("✅ Token verified:", decoded);

    req.user = decoded;
    next();

  } catch (err) {
    console.log("❌ Invalid token");
    return next({ status: 403, message: 'Forbidden: Invalid token' });
  }
};


// 🚨 GLOBAL ERROR HANDLER
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;

  const message =
    err.message || "We're having technical issues. Please try again later";

  console.log("🔥 ERROR:", {
    status: statusCode,
    message,
  });

  res.status(statusCode).json({
    success: false,
    message,
  });
};