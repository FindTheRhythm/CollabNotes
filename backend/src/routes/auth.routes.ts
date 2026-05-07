import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validationMiddleware } from "../middlewares/validation.middleware.js";
import { registerValidation, loginValidation, refreshTokenValidation } from "../validators/auth.validator.js";

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
  authMiddleware,
  refreshTokenValidation(),
  validationMiddleware,
  authController.logout
);

router.post(
  "/refresh",
  refreshTokenValidation(),
  validationMiddleware,
  authController.refresh
);

router.get(
  "/me",
  authMiddleware,
  authController.getCurrentUser
);

export default router;
