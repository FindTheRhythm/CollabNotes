import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { userIdValidation, updateUserValidation } from "../validators/auth.validator.js";
import { paginationValidation } from "../validators/note.validator.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { UserRole } from "../types/index.js";

const router = Router();

router.get(
  "/search",
  asyncHandler(authMiddleware),
  userController.search
);

router.get(
  "/",
  asyncHandler(authMiddleware),
  roleMiddleware(UserRole.ADMIN),
  paginationValidation(),
  validationMiddleware,
  userController.getAll
);

router.get(
  "/:id",
  asyncHandler(authMiddleware),
  userIdValidation(),
  validationMiddleware,
  userController.getById
);

router.put(
  "/:id",
  asyncHandler(authMiddleware),
  userIdValidation(),
  updateUserValidation(),
  validationMiddleware,
  userController.update
);

router.delete(
  "/:id",
  asyncHandler(authMiddleware),
  roleMiddleware(UserRole.ADMIN),
  userIdValidation(),
  validationMiddleware,
  userController.delete
);

export default router;
