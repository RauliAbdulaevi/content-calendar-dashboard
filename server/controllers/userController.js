import { listActivityLogs } from "../services/activityService.js";
import { deleteUser, listUsers, recoverDeletedUser, updateRole } from "../services/userService.js";

export function getUsers(_req, res) {
  res.json(listUsers());
}

export function patchUserRole(req, res) {
  const user = updateRole(req.user, Number(req.params.id), req.body.role);
  res.json(user);
}

export function removeUser(req, res) {
  deleteUser(req.user, Number(req.params.id));
  res.status(204).send();
}

export function getActivity(_req, res) {
  res.json(listActivityLogs());
}

export function recoverUser(req, res) {
  const user = recoverDeletedUser(req.user, Number(req.params.activityId));
  res.json(user);
}
