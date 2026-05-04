import { Router } from "express";
import { noteController } from "../controllers/note.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { createNoteValidation, updateNoteValidation, noteIdValidation, paginationValidation } from "../validators/note.validator.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const router = Router();

router.get(
  "/",
  paginationValidation(),
  validationMiddleware,
  noteController.getAll
);

router.get(
  "/search",
  paginationValidation(),
  validationMiddleware,
  noteController.search
);

router.post(
  "/",
  asyncHandler(authMiddleware),
  createNoteValidation(),
  validationMiddleware,
  noteController.create
);

router.get(
  "/my",
  asyncHandler(authMiddleware),
  paginationValidation(),
  validationMiddleware,
  noteController.getUserNotes
);

router.get(
  "/:id",
  noteIdValidation(),
  validationMiddleware,
  noteController.getById
);

router.put(
  "/:id",
  asyncHandler(authMiddleware),
  noteIdValidation(),
  updateNoteValidation(),
  validationMiddleware,
  noteController.update
);

router.delete(
  "/:id",
  asyncHandler(authMiddleware),
  noteIdValidation(),
  validationMiddleware,
  noteController.delete
);

export default router;
