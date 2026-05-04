import { body, param, query, ValidationChain } from "express-validator";

export const createNoteValidation = (): ValidationChain[] => [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
];

export const updateNoteValidation = (): ValidationChain[] => [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters"),
  body("content")
    .optional()
    .isString()
    .withMessage("Content must be a string")
];

export const noteIdValidation = (): ValidationChain[] => [
  param("id").isUUID().withMessage("Invalid note ID format")
];

export const paginationValidation = (): ValidationChain[] => [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
];
