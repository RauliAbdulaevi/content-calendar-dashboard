import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { readData, writeData, publicUser } from "../models/store.js";
import { AppError } from "../utils/AppError.js";

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  if (String(password).length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const data = readData();
  const exists = data.users.some((item) => item.email.toLowerCase() === normalizedEmail);

  if (exists) {
    throw new AppError("Email is already registered.", 409);
  }

  const user = {
    id: data.nextUserId++,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    role: "user",
    createdAt: new Date().toISOString()
  };

  data.users.push(user);
  writeData(data);

  return { token: signToken(user), user: publicUser(user) };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const data = readData();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = data.users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password.", 401);
  }

  return { token: signToken(user), user: publicUser(user) };
}

export function getUserFromTokenPayload(payload) {
  const data = readData();
  const user = data.users.find((item) => item.id === payload.id);

  if (!user) {
    throw new AppError("User no longer exists.", 401);
  }

  return publicUser(user);
}
