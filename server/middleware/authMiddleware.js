import { getUserFromTokenPayload, signToken, verifyToken } from "../services/authService.js";
import { AppError } from "../utils/AppError.js";

export { signToken };

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required.", 401));
  }

  try {
    const payload = verifyToken(token);
    req.user = getUserFromTokenPayload(payload);
    next();
  } catch (error) {
    if (error.isOperational) {
      return next(error);
    }

    return next(new AppError("Invalid or expired token.", 401));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "admin") {
    return next(new AppError("Admin access required.", 403));
  }

  next();
}
