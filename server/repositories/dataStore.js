import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/db.json");

const seedIdeas = [
  {
    id: 1,
    userId: 1,
    title: "Behind the scenes reel",
    platform: "Instagram",
    contentType: "Reel",
    script: "Show the team planning this month's campaign.",
    caption: "A little look at what goes into each launch.",
    scheduledDate: "2026-05-08",
    scheduledTime: "09:30",
    imageUrl: "",
    status: "Scheduled",
    stats: { impressions: 0, likes: 0, comments: 0, shares: 0 }
  },
  {
    id: 2,
    userId: 2,
    title: "Newsletter launch teaser",
    platform: "LinkedIn",
    contentType: "Post",
    script: "Announce the newsletter and invite signups.",
    caption: "New insights are landing in your inbox soon.",
    scheduledDate: "2026-05-13",
    scheduledTime: "12:00",
    imageUrl: "",
    status: "Draft",
    stats: { impressions: 0, likes: 0, comments: 0, shares: 0 }
  },
  {
    id: 3,
    userId: 1,
    title: "Customer tip carousel",
    platform: "Facebook",
    contentType: "Carousel",
    script: "Three quick content planning tips for small teams.",
    caption: "Save this checklist for your next content sprint.",
    scheduledDate: "2026-05-20",
    scheduledTime: "16:45",
    imageUrl: "",
    status: "Published",
    stats: { impressions: 1840, likes: 126, comments: 18, shares: 34 }
  }
];

function createSeedData() {
  return {
    nextUserId: 3,
    nextIdeaId: 4,
    users: [
      {
        id: 1,
        name: "Admin User",
        email: "admin@example.com",
        passwordHash: bcrypt.hashSync("admin123", 10),
        role: "admin",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: "Demo User",
        email: "user@example.com",
        passwordHash: bcrypt.hashSync("user123", 10),
        role: "user",
        createdAt: new Date().toISOString()
      }
    ],
    ideas: seedIdeas
  };
}

function ensureStore() {
  if (!fs.existsSync(dataPath)) {
    saveData(createSeedData());
  }
}

export function loadData() {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

export function saveData(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export function mutateData(mutator) {
  const data = loadData();
  const result = mutator(data);
  saveData(data);
  return result;
}

export function initializeStore() {
  ensureStore();
}
