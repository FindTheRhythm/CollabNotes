import { body, param, ValidationChain } from "express-validator";

export const shareAccessValidation = (): ValidationChain[] => [
  body("noteId").isUUID().withMessage("Invalid note ID format"),
  body("userId").isUUID().withMessage("Invalid user ID format"),
  body("permission")
    .isIn(["READ", "EDIT"])
    .withMessage("Permission must be either READ or EDIT")
];

export const updateAccessValidation = (): ValidationChain[] => [
  body("permission")
    .isIn(["READ", "EDIT"])
    .withMessage("Permission must be either READ or EDIT")
];

export const accessIdValidation = (): ValidationChain[] => [
  param("id").isUUID().withMessage("Invalid access ID format")
];

export const noteIdAccessValidation = (): ValidationChain[] => [
  param("noteId").isUUID().withMessage("Invalid note ID format")
];
