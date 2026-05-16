import { Request, Response } from "express";
import { NotFoundError, ValidationError, createSuccessResponse } from "../utils/errors.js";
import { sectionRepository } from "../repositories/section.repository.js";

class SectionController {
  async getSections(req: Request, res: Response): Promise<void> {
    const notebookId = req.query.notebookId as string;
    if (!notebookId) throw new ValidationError({ notebookId: ["notebookId is required"] });
    const sections = await sectionRepository.findByNotebookId(notebookId);
    const mapped = sections.map(s => ({
      id: s.id,
      notebookId: s.notebook_id,
      name: s.title,
      position: s.position,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    }));
    res.status(200).json(createSuccessResponse(mapped, "Sections retrieved", 200));
  }

  async getSection(req: Request, res: Response): Promise<void> {
    const section = await sectionRepository.findById(req.params.sectionId);
    if (!section) throw new NotFoundError("Section not found");
    const mapped = {
      id: section.id,
      notebookId: section.notebook_id,
      name: section.title,
      position: section.position,
      createdAt: section.created_at,
      updatedAt: section.updated_at
    };
    res.status(200).json(createSuccessResponse(mapped, "Section retrieved", 200));
  }

  async createSection(req: Request, res: Response): Promise<void> {
    const { notebookId, name, position } = req.body;
    if (!notebookId || !name) throw new ValidationError({ create: ["notebookId and name are required"] });
    const sec = await sectionRepository.create(name, notebookId, position ?? 0);
    const mapped = {
      id: sec.id,
      notebookId: sec.notebook_id,
      name: sec.title,
      position: sec.position,
      createdAt: sec.created_at,
      updatedAt: sec.updated_at
    };
    res.status(201).json(createSuccessResponse(mapped, "Section created", 201));
  }

  async updateSection(req: Request, res: Response): Promise<void> {
    const updates: any = {};
    if (req.body.name !== undefined) updates.title = req.body.name;
    if (req.body.position !== undefined) updates.position = req.body.position;
    const updated = await sectionRepository.update(req.params.sectionId, updates);
    if (!updated) throw new NotFoundError("Section not found after update");
    const mapped = {
      id: updated.id,
      notebookId: updated.notebook_id,
      name: updated.title,
      position: updated.position,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };
    res.status(200).json(createSuccessResponse(mapped, "Section updated", 200));
  }

  async deleteSection(req: Request, res: Response): Promise<void> {
    const ok = await sectionRepository.delete(req.params.sectionId);
    if (!ok) throw new NotFoundError("Section not found");
    res.status(200).json(createSuccessResponse(null, "Section deleted", 200));
  }

  async reorderSections(req: Request, res: Response): Promise<void> {
    const { sectionIds, orderedIds } = req.body;
    const ids = Array.isArray(sectionIds) ? sectionIds : orderedIds;
    if (!ids || !Array.isArray(ids)) throw new ValidationError({ reorder: ["sectionIds or orderedIds array required"] });
    // Update positions in DB
    const updates = ids.map((id: string, index: number) => sectionRepository.update(id, { position: index }));
    await Promise.all(updates);
    res.status(200).json(createSuccessResponse(null, "Sections reordered", 200));
  }
}

export const sectionController = new SectionController();
