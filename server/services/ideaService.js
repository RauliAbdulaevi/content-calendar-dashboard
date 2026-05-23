import { canAccessIdea, normalizeStats } from "../models/Idea.js";
import { mutateData, readData } from "../models/store.js";
import { AppError } from "../utils/AppError.js";
import { recordActivity } from "./activityService.js";

export function listIdeasForUser(user) {
  const data = readData();
  return user.role === "admin" ? data.ideas : data.ideas.filter((idea) => idea.userId === user.id);
}

export function createIdeaForUser(user, payload) {
  const { title, platform, contentType, script, caption, scheduledDate, scheduledTime, imageUrl, status, stats } = payload;

  if (!title || !scheduledDate || !scheduledTime) {
    throw new AppError("Title, scheduled date, and scheduled time are required.", 400);
  }

  return mutateData((data) => {
    const idea = {
      id: data.nextIdeaId++,
      userId: user.id,
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

    data.ideas.push(idea);
    recordActivity(data, user, "idea.created", `Created "${idea.title}"`);
    return idea;
  });
}

export function updateIdeaForUser(user, id, payload) {
  return mutateData((data) => {
    const index = data.ideas.findIndex((idea) => idea.id === id);

    if (index === -1) {
      throw new AppError("Content idea not found.", 404);
    }

    if (!canAccessIdea(user, data.ideas[index])) {
      throw new AppError("You can only update your own content ideas.", 403);
    }

    const previous = data.ideas[index];
    data.ideas[index] = {
      ...previous,
      ...payload,
      id,
      userId: previous.userId,
      stats: normalizeStats(payload.stats || previous.stats)
    };

    if (previous.scheduledDate !== data.ideas[index].scheduledDate) {
      recordActivity(data, user, "idea.rescheduled", `Moved "${data.ideas[index].title}" to ${data.ideas[index].scheduledDate}`);
    } else if (previous.status !== data.ideas[index].status) {
      recordActivity(data, user, "idea.status", `Changed "${data.ideas[index].title}" to ${data.ideas[index].status}`);
    } else {
      recordActivity(data, user, "idea.updated", `Updated "${data.ideas[index].title}"`);
    }

    return data.ideas[index];
  });
}

export function deleteIdeaForUser(user, id) {
  mutateData((data) => {
    const idea = data.ideas.find((item) => item.id === id);

    if (!idea) {
      throw new AppError("Content idea not found.", 404);
    }

    if (!canAccessIdea(user, idea)) {
      throw new AppError("You can only delete your own content ideas.", 403);
    }

    data.ideas = data.ideas.filter((item) => item.id !== id);
    recordActivity(data, user, "idea.deleted", `Deleted "${idea.title}"`);
  });
}
