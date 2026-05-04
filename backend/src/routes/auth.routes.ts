import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { registerValidation, loginValidation } from "../validators/auth.validator.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const router = Router();

router.post(
  "/register",
  registerValidation(),
  validationMiddleware,
  authController.register
);

router.post(
  "/login",
  loginValidation(),
  validationMiddleware,
  authController.login
);

router.post(
  "/logout",
  asyncHandler(authMiddleware),
  authController.logout
);

router.post(
  "/refresh",
  authController.refresh
);

router.get(
  "/me",
  asyncHandler(authMiddleware),
  authController.getCurrentUser
);

export default router;
