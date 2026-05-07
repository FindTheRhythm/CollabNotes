import { Request, Response } from "express";
import { noteService } from "../services/note.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { getPaginationParams } from "../utils/helpers.js";

export class NoteController {
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = getPaginationParams(req.query.page, req.query.limit);
    const result = await noteService.getAllNotes(req.user!.userId, req.user!.role, page, limit);

    res.status(200).json(
      createSuccessResponse(result, "Notes retrieved successfully", 200)
    );
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const note = await noteService.getNoteById(req.params.id, req.user!.userId, req.user!.role);

    res.status(200).json(
      createSuccessResponse(note, "Note retrieved successfully", 200)
    );
  });

  getUserNotes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = getPaginationParams(req.query.page, req.query.limit);
    const result = await noteService.getUserNotes(req.user!.userId, page, limit);

    res.status(200).json(
      createSuccessResponse(result, "User notes retrieved successfully", 200)
    );
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, content } = req.body;
    const note = await noteService.createNote(title, content, req.user!.userId);

    res.status(201).json(
      createSuccessResponse(note, "Note created successfully", 201)
    );
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, content } = req.body;
    const note = await noteService.updateNote(
      req.params.id,
      title,
      content,
      req.user!.userId,
      req.user!.role
    );

    res.status(200).json(
      createSuccessResponse(note, "Note updated successfully", 200)
    );
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await noteService.deleteNote(req.params.id, req.user!.userId, req.user!.role);

    res.status(200).json(
      createSuccessResponse(null, "Note deleted successfully", 200)
    );
  });

  search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const { page, limit } = getPaginationParams(req.query.page, req.query.limit);

    if (!q || typeof q !== "string") {
      res.status(400).json(
        createSuccessResponse(null, "Search query is required", 400)
      );
      return;
    }

    const result = await noteService.searchNotes(
      q,
      req.user!.userId,
      req.user!.role,
      page,
      limit
    );

    res.status(200).json(
      createSuccessResponse(result, "Search results retrieved successfully", 200)
    );
  });
}

export const noteController = new NoteController();
