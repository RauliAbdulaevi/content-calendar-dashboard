import express from "express";
import { addComment, createIdea, deleteIdea, getNotifications, listIdeas, updateIdea } from "../controllers/ideaController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validationMiddleware.js";
import { validateCommentPayload, validateIdeaPayload } from "../utils/validators.js";

const router = express.Router();

router.use(requireAuth);
router.get("/notifications", getNotifications);
router.route("/").get(listIdeas).post(validateBody(validateIdeaPayload), createIdea);
router.post("/:id/comments", validateBody(validateCommentPayload), addComment);
router.route("/:id").put(validateBody(validateIdeaPayload), updateIdea).delete(deleteIdea);

export default router;
