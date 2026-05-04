import { Router } from "express";
import { commentController } from "../controllers/comment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { createCommentValidation, updateCommentValidation, commentIdValidation, noteIdCommentValidation } from "../validators/comment.validator.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const router = Router();

router.post(
  "/",
  asyncHandler(authMiddleware),
  createCommentValidation(),
  validationMiddleware,
  commentController.create
);

router.get(
  "/:noteId",
  noteIdCommentValidation(),
  validationMiddleware,
  commentController.getNoteComments
);

router.put(
  "/:id",
  asyncHandler(authMiddleware),
  commentIdValidation(),
  updateCommentValidation(),
  validationMiddleware,
  commentController.update
);

router.delete(
  "/:id",
  asyncHandler(authMiddleware),
  commentIdValidation(),
  validationMiddleware,
  commentController.delete
);

export default router;
