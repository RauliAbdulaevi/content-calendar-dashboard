import { deleteUser, listUsers, updateRole } from "../services/userService.js";

export function getUsers(_req, res) {
  res.json(listUsers());
}

export function patchUserRole(req, res) {
  const user = updateRole(Number(req.params.id), req.body.role);
  res.json(user);
}

export function removeUser(req, res) {
  deleteUser(req.user, Number(req.params.id));
  res.status(204).send();
}
