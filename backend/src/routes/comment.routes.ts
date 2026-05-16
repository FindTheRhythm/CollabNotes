import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { createCommentValidation, updateCommentValidation, commentIdValidation, noteIdCommentValidation } from "../validators/comment.validator.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    message: "Comment routes",
    endpoints: {
      create: "/api/comments",
      getByNote: "/api/comments/:noteId",
      update: "/api/comments/:id",
      delete: "/api/comments/:id"
    }
  });
});

router.post(
  "/",
  authMiddleware,
  createCommentValidation(),
  validationMiddleware,
  commentController.create
);

router.get(
  "/:noteId",
  authMiddleware,
  noteIdCommentValidation(),
  validationMiddleware,
  commentController.getNoteComments
);

router.put(
  "/:id",
  authMiddleware,
  commentIdValidation(),
  updateCommentValidation(),
  validationMiddleware,
  commentController.update
);

router.delete(
  "/:id",
  authMiddleware,
  commentIdValidation(),
  validationMiddleware,
  commentController.delete
);

export default router;
