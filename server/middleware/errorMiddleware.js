import { AppError } from "../utils/AppError.js";

export function notFound(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : "Something went wrong.";
  const response = {
    error: {
      message,
      statusCode
    }
  };

  if (error.details) {
    response.error.details = error.details;
  }

  if (!error.isOperational) {
    console.error(error);
  }

  res.status(statusCode).json(response);
}
