export const env = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || "content-calendar-dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  jsonLimit: process.env.JSON_LIMIT || "10mb"
};
