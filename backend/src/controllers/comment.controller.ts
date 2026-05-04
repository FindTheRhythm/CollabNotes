import { Request, Response } from "express";
import { commentService } from "../services/comment.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

export class CommentController {
  getNoteComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comments = await commentService.getNoteComments(req.params.noteId);

    res.status(200).json(
      createSuccessResponse(comments, "Comments retrieved successfully", 200)
    );
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { noteId, content } = req.body;
    const comment = await commentService.createComment(noteId, req.user!.userId, content);

    res.status(201).json(
      createSuccessResponse(comment, "Comment created successfully", 201)
    );
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { content } = req.body;
    const comment = await commentService.updateComment(req.params.id, content, req.user!.userId);

    res.status(200).json(
      createSuccessResponse(comment, "Comment updated successfully", 200)
    );
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await commentService.deleteComment(req.params.id, req.user!.userId);

    res.status(200).json(
      createSuccessResponse(null, "Comment deleted successfully", 200)
    );
  });
}

export const commentController = new CommentController();
