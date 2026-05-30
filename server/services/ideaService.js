import { canAccessIdea, canEditIdea, normalizeStats } from "../models/Idea.js";
import { canApproveContent, canCreateContent } from "../models/User.js";
import { mutateData, readData } from "../models/store.js";
import { AppError } from "../utils/AppError.js";
import { recordActivity } from "./activityService.js";

export function listIdeasForUser(user) {
  const data = readData();
  const visibleIdeas = ["admin", "manager", "viewer"].includes(user.role) ? data.ideas : data.ideas.filter((idea) => idea.userId === user.id);
  return visibleIdeas.map((idea) => enrichIdea(data, idea));
}

function enrichIdea(data, idea) {
  const owner = data.users.find((item) => item.id === idea.userId);
  return {
    ...idea,
    campaign: idea.campaign || "",
    approvalNote: idea.approvalNote || "",
    comments: idea.comments || [],
    ownerName: owner?.name || "Unknown",
    ownerEmail: owner?.email || ""
  };
}

export function createIdeaForUser(user, payload) {
  if (!canCreateContent(user)) {
    throw new AppError("Viewers cannot create content ideas.", 403);
  }

  const { title, platform, contentType, script, caption, scheduledDate, scheduledTime, imageUrl, status, stats, campaign, approvalNote } = payload;

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
      campaign: campaign || "",
      approvalNote: approvalNote || "",
      comments: [],
      status: status || "Draft",
      stats: normalizeStats(stats)
    };

    data.ideas.push(idea);
    recordActivity(data, user, "idea.created", `Created "${idea.title}"`);
    return enrichIdea(data, idea);
  });
}

export function updateIdeaForUser(user, id, payload) {
  return mutateData((data) => {
    const index = data.ideas.findIndex((idea) => idea.id === id);

    if (index === -1) {
      throw new AppError("Content idea not found.", 404);
    }

    if (!canEditIdea(user, data.ideas[index])) {
      throw new AppError("You can only update your own content ideas.", 403);
    }

    const previous = data.ideas[index];
    const nextStatus = payload.status || previous.status;

    if (["Approved", "Published"].includes(nextStatus) && !canApproveContent(user)) {
      throw new AppError("Only admins and managers can approve or publish content.", 403);
    }

    data.ideas[index] = {
      ...previous,
      ...payload,
      id,
      userId: previous.userId,
      comments: previous.comments || [],
      stats: normalizeStats(payload.stats || previous.stats)
    };

    if (previous.scheduledDate !== data.ideas[index].scheduledDate) {
      recordActivity(data, user, "idea.rescheduled", `Moved "${data.ideas[index].title}" to ${data.ideas[index].scheduledDate}`);
    } else if (previous.status !== data.ideas[index].status) {
      recordActivity(data, user, "idea.status", `Changed "${data.ideas[index].title}" to ${data.ideas[index].status}`);
    } else {
      recordActivity(data, user, "idea.updated", `Updated "${data.ideas[index].title}"`);
    }

    return enrichIdea(data, data.ideas[index]);
  });
}

export function deleteIdeaForUser(user, id) {
  mutateData((data) => {
    const idea = data.ideas.find((item) => item.id === id);

    if (!idea) {
      throw new AppError("Content idea not found.", 404);
    }

    if (!canEditIdea(user, idea)) {
      throw new AppError("You can only delete your own content ideas.", 403);
    }

    data.ideas = data.ideas.filter((item) => item.id !== id);
    recordActivity(data, user, "idea.deleted", `Deleted "${idea.title}"`);
  });
}

export function addCommentForIdea(user, id, message) {
  return mutateData((data) => {
    const idea = data.ideas.find((item) => item.id === id);

    if (!idea) {
      throw new AppError("Content idea not found.", 404);
    }

    if (!canAccessIdea(user, idea)) {
      throw new AppError("You can only comment on accessible content ideas.", 403);
    }

    const comment = {
      id: Date.now(),
      userId: user.id,
      authorName: user.name,
      authorRole: user.role,
      message,
      createdAt: new Date().toISOString()
    };

    idea.comments = [...(idea.comments || []), comment];
    recordActivity(data, user, "idea.comment", `Commented on "${idea.title}"`);

    return enrichIdea(data, idea);
  });
}

export function buildNotificationsForUser(user) {
  const now = new Date();
  const ideas = listIdeasForUser(user);

  return ideas
    .flatMap((idea) => {
      const scheduledAt = new Date(`${idea.scheduledDate}T${idea.scheduledTime || "00:00"}`);
      const hoursUntil = (scheduledAt.getTime() - now.getTime()) / 36e5;
      const items = [];

      if (idea.status === "In Review" && canApproveContent(user)) {
        items.push({ id: `approval-${idea.id}`, type: "approval", title: "Approval request", message: `"${idea.title}" is waiting for review.`, read: false });
      }

      if (idea.status !== "Published" && hoursUntil < 0) {
        items.push({ id: `overdue-${idea.id}`, type: "overdue", title: "Overdue post", message: `"${idea.title}" missed its scheduled time.`, read: false });
      } else if (idea.status !== "Published" && hoursUntil <= 24) {
        items.push({ id: `upcoming-${idea.id}`, type: "upcoming", title: "Upcoming post", message: `"${idea.title}" is scheduled soon.`, read: false });
      }

      if (idea.approvalNote) {
        items.push({ id: `note-${idea.id}`, type: "changes", title: "Requested changes", message: idea.approvalNote, read: false });
      }

      return items;
    })
    .slice(0, 8);
}
