import { Request, Response } from "express";
import { NotFoundError, ForbiddenError, ValidationError, createSuccessResponse } from "../utils/errors.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";

class NotebookController {
  getNotebooks = async (req: Request, res: Response): Promise<void> => {
    const workspaceId = req.query.workspaceId as string;
    if (!workspaceId) throw new ValidationError({ workspaceId: ["workspaceId is required"] });
    const notebooks = await notebookRepository.findByWorkspaceId(workspaceId);
    // map DB fields to API shape expected by frontend
    const mapped = notebooks.map(n => ({
      id: n.id,
      workspaceId: n.workspace_id,
      name: n.title,
      description: null,
      color: n.color || null,
      icon: n.icon || null,
      owner: n.owner_id,
      collaborators: [],
      position: n.position,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));
    res.status(200).json(createSuccessResponse(mapped, "Notebooks retrieved", 200));
  };

  getNotebook = async (req: Request, res: Response): Promise<void> => {
    const notebook = await notebookRepository.findById(req.params.notebookId);
    if (!notebook) throw new NotFoundError("Notebook not found");
    const mapped = {
      id: notebook.id,
      workspaceId: notebook.workspace_id,
      name: notebook.title,
      description: null,
      color: notebook.color || null,
      icon: notebook.icon || null,
      owner: notebook.owner_id,
      collaborators: [],
      position: notebook.position,
      createdAt: notebook.created_at,
      updatedAt: notebook.updated_at,
    };
    res.status(200).json(createSuccessResponse(mapped, "Notebook retrieved", 200));
  };

  createNotebook = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { workspaceId, name, description, color, icon } = req.body;
    if (!userId) throw new ForbiddenError("Authentication required");
    if (!workspaceId || !name) throw new ValidationError({ create: ["workspaceId and name are required"] });
    const nb = await notebookRepository.create(name, workspaceId, userId, color || null, icon || null);
    
    // Create default section for new notebook
    try {
      await sectionRepository.create("Основное", nb.id, 0);
    } catch (error) {
      console.warn("[NOTEBOOK CONTROLLER] Failed to create default section:", error);
      // Don't fail the notebook creation if section creation fails
    }
    
    const mapped = {
      id: nb.id,
      workspaceId: nb.workspace_id,
      name: nb.title,
      description: null,
      color: nb.color || null,
      icon: nb.icon || null,
      owner: nb.owner_id,
      collaborators: [],
      position: nb.position,
      createdAt: nb.created_at,
      updatedAt: nb.updated_at,
    };
    res.status(201).json(createSuccessResponse(mapped, "Notebook created", 201));
  };

  updateNotebook = async (req: Request, res: Response): Promise<void> => {
    const notebook = await notebookRepository.findById(req.params.notebookId);
    if (!notebook) throw new NotFoundError("Notebook not found");
    if (notebook.owner_id !== req.user?.userId) throw new ForbiddenError("No permission");
    const updates: any = {};
    if (req.body.name) updates.title = req.body.name;
    if (req.body.color) updates.color = req.body.color;
    if (req.body.icon) updates.icon = req.body.icon;
    if (req.body.position !== undefined) updates.position = req.body.position;
    const updated = await notebookRepository.update(req.params.notebookId, updates);
    if (!updated) throw new NotFoundError("Notebook not found after update");
    const mapped = {
      id: updated.id,
      workspaceId: updated.workspace_id,
      name: updated.title,
      description: null,
      color: updated.color || null,
      icon: updated.icon || null,
      owner: updated.owner_id,
      collaborators: [],
      position: updated.position,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
    res.status(200).json(createSuccessResponse(mapped, "Notebook updated", 200));
  };

  deleteNotebook = async (req: Request, res: Response): Promise<void> => {
    const notebook = await notebookRepository.findById(req.params.notebookId);
    if (!notebook) throw new NotFoundError("Notebook not found");
    if (notebook.owner_id !== req.user?.userId) throw new ForbiddenError("No permission");
    await notebookRepository.delete(req.params.notebookId);
    res.status(200).json(createSuccessResponse(null, "Notebook deleted", 200));
  };
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
