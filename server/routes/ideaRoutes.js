import express from "express";
import { createIdea, deleteIdea, listIdeas, updateIdea } from "../controllers/ideaController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { validateIdeaPayload } from "../utils/validators.js";

const router = express.Router();

router.use(requireAuth);
router.route("/").get(listIdeas).post(validateBody(validateIdeaPayload), createIdea);
router.route("/:id").put(validateBody(validateIdeaPayload), updateIdea).delete(deleteIdea);

export default router;
