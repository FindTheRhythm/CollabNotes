import { Request, Response } from "express";
import { accessService } from "../services/access.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

export class AccessController {
  share = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { noteId, userId, permission } = req.body;
    const access = await accessService.shareNote(noteId, userId, permission, req.user!.userId);

    res.status(201).json(
      createSuccessResponse(access, "Access granted successfully", 201)
    );
  });

  getAccessList = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const accessList = await accessService.getNoteAccess(req.params.noteId, req.user!.userId);

    res.status(200).json(
      createSuccessResponse(accessList, "Access list retrieved successfully", 200)
    );
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { permission } = req.body;
    const access = await accessService.updateAccess(req.params.id, permission, req.user!.userId);

    res.status(200).json(
      createSuccessResponse(access, "Access updated successfully", 200)
    );
  });

  remove = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await accessService.removeAccess(req.params.id, req.user!.userId);

    res.status(200).json(
      createSuccessResponse(null, "Access removed successfully", 200)
    );
  });
}

export const accessController = new AccessController();
