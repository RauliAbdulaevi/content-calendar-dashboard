import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

let nextId = 4;

let ideas = [
  {
    id: 1,
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

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/ideas", (_req, res) => {
  res.json(ideas);
});

app.post("/api/ideas", (req, res) => {
  const { title, platform, contentType, script, caption, scheduledDate, scheduledTime, imageUrl, status, stats } = req.body;

  if (!title || !scheduledDate || !scheduledTime) {
    return res.status(400).json({ message: "Title, scheduled date, and scheduled time are required." });
  }

  const idea = {
    id: nextId++,
    title,
    platform: platform || "Instagram",
    contentType: contentType || "Post",
    script: script || "",
    caption: caption || "",
    scheduledDate,
    scheduledTime,
    imageUrl: imageUrl || "",
    status: status || "Draft",
    stats: normalizeStats(stats)
  };

  ideas.push(idea);
  res.status(201).json(idea);
});

app.put("/api/ideas/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = ideas.findIndex((idea) => idea.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Content idea not found." });
  }

  ideas[index] = {
    ...ideas[index],
    ...req.body,
    id,
    stats: normalizeStats(req.body.stats || ideas[index].stats)
  };
  res.json(ideas[index]);
});

app.delete("/api/ideas/:id", (req, res) => {
  const id = Number(req.params.id);
  const exists = ideas.some((idea) => idea.id === id);

  if (!exists) {
    return res.status(404).json({ message: "Content idea not found." });
  }

  ideas = ideas.filter((idea) => idea.id !== id);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`REST API running on http://localhost:${PORT}`);
});

function normalizeStats(stats = {}) {
  return {
    impressions: Number(stats.impressions) || 0,
    likes: Number(stats.likes) || 0,
    comments: Number(stats.comments) || 0,
    shares: Number(stats.shares) || 0
  };
}
