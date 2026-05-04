import { Router } from "express";
import { accessController } from "../controllers/access.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { shareAccessValidation, updateAccessValidation, accessIdValidation, noteIdAccessValidation } from "../validators/access.validator.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const router = Router();

router.post(
  "/share",
  asyncHandler(authMiddleware),
  shareAccessValidation(),
  validationMiddleware,
  accessController.share
);

router.get(
  "/:noteId",
  asyncHandler(authMiddleware),
  noteIdAccessValidation(),
  validationMiddleware,
  accessController.getAccessList
);

router.put(
  "/:id",
  asyncHandler(authMiddleware),
  accessIdValidation(),
  updateAccessValidation(),
  validationMiddleware,
  accessController.update
);

router.delete(
  "/:id",
  asyncHandler(authMiddleware),
  accessIdValidation(),
  validationMiddleware,
  accessController.remove
);

export default router;
