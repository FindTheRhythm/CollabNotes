import { body, param, ValidationChain } from "express-validator";

export const shareAccessValidation = (): ValidationChain[] => [
  body("resourceType")
    .isIn(["NOTE", "WORKSPACE", "NOTEBOOK"])
    .withMessage("Resource type must be NOTE, WORKSPACE, or NOTEBOOK"),
  body("resourceId").isUUID().withMessage("Invalid resource ID format"),
  body("userId").isUUID().withMessage("Invalid user ID format"),
  body("permission")
    .isIn(["READ", "WRITE", "ADMIN"])
    .withMessage("Permission must be READ, WRITE, or ADMIN")
];

export const updateAccessValidation = (): ValidationChain[] => [
  body("permission")
    .isIn(["READ", "WRITE", "ADMIN"])
    .withMessage("Permission must be READ, WRITE, or ADMIN")
];

export const accessIdValidation = (): ValidationChain[] => [
  param("id").isUUID().withMessage("Invalid access ID format")
];

export const resourceParamsValidation = (): ValidationChain[] => [
  param("resourceType")
    .isIn(["NOTE", "WORKSPACE", "NOTEBOOK"])
    .withMessage("Resource type must be NOTE, WORKSPACE, or NOTEBOOK"),
  param("resourceId").isUUID().withMessage("Invalid resource ID format")
];

export const noteIdAccessValidation = (): ValidationChain[] => [
  param("noteId").isUUID().withMessage("Invalid note ID format")
];
