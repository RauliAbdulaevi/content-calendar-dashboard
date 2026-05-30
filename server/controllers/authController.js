import { loginUser, registerUser, updateCurrentUserProfile } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json(data);
});

export const login = asyncHandler(async (req, res) => {
  const data = await loginUser(req.body);
  res.json(data);
});

export function me(req, res) {
  res.json({ user: req.user });
}

export const updateMe = asyncHandler(async (req, res) => {
  const user = await updateCurrentUserProfile(req.user, req.body);
  res.json({ user });
});
