import { body, param, query, ValidationChain } from "express-validator";
import { validatePasswordStrength } from "../utils/password.js";

export const registerValidation = (): ValidationChain[] => [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("password")
    .trim()
    .custom((value) => {
      const errors = validatePasswordStrength(value);
      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }
      return true;
    })
];

export const loginValidation = (): ValidationChain[] => [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email address"),
  body("password").notEmpty().withMessage("Password is required")
];

export const refreshTokenValidation = (): ValidationChain[] => [
  body("refreshToken").notEmpty().withMessage("Refresh token is required")
];

export const updateUserValidation = (): ValidationChain[] => [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email address")
];

export const userIdValidation = (): ValidationChain[] => [
  param("id").isUUID().withMessage("Invalid user ID format")
];
