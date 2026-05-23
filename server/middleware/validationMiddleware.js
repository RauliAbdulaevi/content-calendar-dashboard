import { AppError } from "../utils/AppError.js";

export function validateBody(validator) {
  return (req, _res, next) => {
    try {
      req.body = validator(req.body || {});
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireFields(payload, fields) {
  const missing = fields.filter((field) => !String(payload[field] || "").trim());

  if (missing.length) {
    throw new AppError(`Missing required fields: ${missing.join(", ")}.`, 400, {
      fields: missing
    });
  }
}
