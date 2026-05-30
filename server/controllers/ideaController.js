import {
  addCommentForIdea,
  buildNotificationsForUser,
  createIdeaForUser,
  deleteIdeaForUser,
  listIdeasForUser,
  updateIdeaForUser
} from "../services/ideaService.js";

export function listIdeas(req, res) {
  res.json(listIdeasForUser(req.user));
}

export function createIdea(req, res) {
  const idea = createIdeaForUser(req.user, req.body);
  res.status(201).json(idea);
}

export function updateIdea(req, res) {
  const idea = updateIdeaForUser(req.user, Number(req.params.id), req.body);
  res.json(idea);
}

export function addComment(req, res) {
  const idea = addCommentForIdea(req.user, Number(req.params.id), req.body.message);
  res.status(201).json(idea);
}

export function getNotifications(req, res) {
  res.json(buildNotificationsForUser(req.user));
}

export function deleteIdea(req, res) {
  deleteIdeaForUser(req.user, Number(req.params.id));
  res.status(204).send();
}
