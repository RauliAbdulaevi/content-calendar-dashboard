import express from "express";
import { login, me, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { validateLoginPayload, validateRegisterPayload } from "../utils/validators.js";

const router = express.Router();

router.post("/register", validateBody(validateRegisterPayload), register);
router.post("/login", validateBody(validateLoginPayload), login);
router.get("/me", requireAuth, me);

export default router;
