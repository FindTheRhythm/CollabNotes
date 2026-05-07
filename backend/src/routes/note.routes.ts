import { Router } from "express";
import { noteController } from "../controllers/note.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { createNoteValidation, updateNoteValidation, noteIdValidation, paginationValidation } from "../validators/note.validator.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  paginationValidation(),
  validationMiddleware,
  noteController.getAll
);

router.get(
  "/search",
  authMiddleware,
  paginationValidation(),
  validationMiddleware,
  noteController.search
);

router.post(
  "/",
  authMiddleware,
  createNoteValidation(),
  validationMiddleware,
  noteController.create
);

router.get(
  "/my",
  authMiddleware,
  paginationValidation(),
  validationMiddleware,
  noteController.getUserNotes
);

router.get(
  "/:id",
  authMiddleware,
  noteIdValidation(),
  validationMiddleware,
  noteController.getById
);

router.put(
  "/:id",
  authMiddleware,
  noteIdValidation(),
  updateNoteValidation(),
  validationMiddleware,
  noteController.update
);

router.delete(
  "/:id",
  authMiddleware,
  noteIdValidation(),
  validationMiddleware,
  noteController.delete
);

export default router;
