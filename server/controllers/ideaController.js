import { createIdeaForUser, deleteIdeaForUser, listIdeasForUser, updateIdeaForUser } from "../services/ideaService.js";

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

export function deleteIdea(req, res) {
  deleteIdeaForUser(req.user, Number(req.params.id));
  res.status(204).send();
}
