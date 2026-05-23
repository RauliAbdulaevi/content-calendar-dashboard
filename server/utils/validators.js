import { statuses } from "../models/Idea.js";
import { isValidRole } from "../models/User.js";
import { AppError } from "./AppError.js";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeOptionalText(value) {
  return value ? String(value).trim() : "";
}

function normalizeStats(stats = {}) {
  return {
    impressions: Number(stats.impressions || 0),
    likes: Number(stats.likes || 0),
    comments: Number(stats.comments || 0),
    shares: Number(stats.shares || 0)
  };
}

export function validateRegisterPayload(payload) {
  const name = normalizeText(payload.name);
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || "");

  if (!name || !email || !password) {
    throw new AppError("Name, email, and password are required.", 400);
  }

  if (!email.includes("@")) {
    throw new AppError("Enter a valid email address.", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters.", 400);
  }

  return { name, email, password };
}

export function validateLoginPayload(payload) {
  const email = normalizeText(payload.email).toLowerCase();
  const password = String(payload.password || "");

  if (!email || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  return { email, password };
}

export function validateIdeaPayload(payload) {
  const title = normalizeText(payload.title);
  const scheduledDate = normalizeText(payload.scheduledDate);
  const scheduledTime = normalizeText(payload.scheduledTime);
  const status = normalizeText(payload.status || "Draft");

  if (!title || !scheduledDate || !scheduledTime) {
    throw new AppError("Title, scheduled date, and scheduled time are required.", 400);
  }

  if (!statuses.includes(status)) {
    throw new AppError("Status must be Idea, Draft, In Review, Approved, Scheduled, or Published.", 400);
  }

  return {
    title,
    platform: normalizeOptionalText(payload.platform) || "Instagram",
    contentType: normalizeOptionalText(payload.contentType) || "Post",
    script: normalizeOptionalText(payload.script),
    caption: normalizeOptionalText(payload.caption),
    scheduledDate,
    scheduledTime,
    imageUrl: normalizeOptionalText(payload.imageUrl),
    status,
    stats: normalizeStats(payload.stats)
  };
}

export function validateRolePayload(payload) {
  const role = normalizeText(payload.role);

  if (!isValidRole(role)) {
    throw new AppError("Role must be admin or user.", 400);
  }

  return { role };
}
