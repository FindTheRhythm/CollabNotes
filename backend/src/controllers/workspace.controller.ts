import { Request, Response } from "express";
import { workspaceService } from "../services/workspace.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

export class WorkspaceController {
  getWorkspaces = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workspaces = await workspaceService.getWorkspaces(req.user!.userId);
    res.status(200).json(createSuccessResponse(workspaces, "Workspaces retrieved successfully", 200));
  });

  getWorkspace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workspace = await workspaceService.getWorkspace(req.params.workspaceId);
    res.status(200).json(createSuccessResponse(workspace, "Workspace retrieved successfully", 200));
  });

  createWorkspace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workspace = await workspaceService.createWorkspace(req.body, req.user!.userId);
    res.status(201).json(createSuccessResponse(workspace, "Workspace created successfully", 201));
  });

  updateWorkspace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const workspace = await workspaceService.updateWorkspace(
      req.params.workspaceId,
      req.body,
      req.user!.userId
    );
    res.status(200).json(createSuccessResponse(workspace, "Workspace updated successfully", 200));
  });

  deleteWorkspace = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await workspaceService.deleteWorkspace(req.params.workspaceId, req.user!.userId);
    res.status(200).json(createSuccessResponse(null, "Workspace deleted successfully", 200));
  });
}

export const workspaceController = new WorkspaceController();
