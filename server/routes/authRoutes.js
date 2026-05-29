import express from "express";
import { login, me, register, updateMe } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { validateLoginPayload, validateProfilePayload, validateRegisterPayload } from "../utils/validators.js";

const router = express.Router();

router.post("/register", validateBody(validateRegisterPayload), register);
router.post("/login", validateBody(validateLoginPayload), login);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validateBody(validateProfilePayload), updateMe);

export default router;
