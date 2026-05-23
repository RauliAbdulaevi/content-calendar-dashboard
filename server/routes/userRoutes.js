import express from "express";
import { getActivity, getUsers, patchUserRole, removeUser } from "../controllers/userController.js";
import { requireAdmin, requireAuth } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { validateRolePayload } from "../utils/validators.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/activity", getActivity);
router.get("/", getUsers);
router.patch("/:id/role", validateBody(validateRolePayload), patchUserRole);
router.delete("/:id", removeUser);

export default router;
