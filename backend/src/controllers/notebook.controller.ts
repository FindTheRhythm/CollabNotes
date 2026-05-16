import { Request, Response } from "express";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";

class NotebookController {
  async reorderNotebooks(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { workspaceId, orderedIds } = req.body;

    if (!userId) {
      throw new ForbiddenError("You must be authenticated to reorder notebooks");
    }

    if (!workspaceId || !Array.isArray(orderedIds)) {
      throw new ValidationError({ reorder: ["workspaceId and orderedIds are required"] });
    }

    const notebooks = await notebookRepository.findByWorkspaceId(workspaceId);

    if (notebooks.length === 0) {
      throw new NotFoundError("Workspace or notebooks not found");
    }

    const ownerId = notebooks[0].owner_id;
    if (ownerId !== userId) {
      throw new ForbiddenError("You do not have permission to reorder notebooks in this workspace");
    }

    const validIds = new Set(notebooks.map(n => n.id));
    const updates = orderedIds
      .filter(id => validIds.has(id))
      .map((id, index) => notebookRepository.update(id, { position: index }));

    await Promise.all(updates);

    res.status(200).json({ success: true, message: "Notebooks reordered" });
  }

  async reorderSections(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { notebookId, orderedIds } = req.body;

    if (!userId) {
      throw new ForbiddenError("You must be authenticated to reorder sections");
    }

    if (!notebookId || !Array.isArray(orderedIds)) {
      throw new ValidationError({ reorder: ["notebookId and orderedIds are required"] });
    }

    const notebook = await notebookRepository.findById(notebookId);
    if (!notebook) {
      throw new NotFoundError("Notebook not found");
    }

    if (notebook.owner_id !== userId) {
      throw new ForbiddenError("You do not have permission to reorder sections in this notebook");
    }

    const sections = await sectionRepository.findByNotebookId(notebookId);
    const validIds = new Set(sections.map(section => section.id));

    const updates = orderedIds
      .filter(id => validIds.has(id))
      .map((id, index) => sectionRepository.update(id, { position: index }));

    await Promise.all(updates);

    res.status(200).json({ success: true, message: "Sections reordered" });
  }
}

export const notebookController = new NotebookController();
