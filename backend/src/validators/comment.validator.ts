import { body, param, ValidationChain } from "express-validator";

export const createCommentValidation = (): ValidationChain[] => [
  body("noteId").isUUID().withMessage("Invalid note ID format"),
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content must be between 1 and 1000 characters")
];

export const updateCommentValidation = (): ValidationChain[] => [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Content must be between 1 and 1000 characters")
];

export const commentIdValidation = (): ValidationChain[] => [
  param("id").isUUID().withMessage("Invalid comment ID format")
];

export const noteIdCommentValidation = (): ValidationChain[] => [
  param("noteId").isUUID().withMessage("Invalid note ID format")
];
