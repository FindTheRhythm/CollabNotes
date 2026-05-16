import { Request, Response } from "express";
import { NotFoundError, ForbiddenError, ValidationError } from "../utils/errors.js";
import { pageRepository } from "../repositories/page.repository.js";
import { contentBlockRepository } from "../repositories/content-block.repository.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";

class ContentBlockController {
  async reorderBlocks(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const { pageId, orderedIds } = req.body;

    if (!userId) {
      throw new ForbiddenError("You must be authenticated to reorder blocks");
    }

    if (!pageId || !Array.isArray(orderedIds)) {
      throw new ValidationError({ reorder: ["pageId and orderedIds are required"] });
    }

    const page = await pageRepository.findById(pageId);
    if (!page) {
      throw new NotFoundError("Page not found");
    }

    const section = await sectionRepository.findById(page.section_id);
    if (!section) {
      throw new NotFoundError("Section for page not found");
    }

    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) {
      throw new NotFoundError("Notebook for section not found");
    }

    if (notebook.owner_id !== userId) {
      throw new ForbiddenError("You do not have permission to reorder blocks on this page");
    }

    const blocks = await contentBlockRepository.findByPageId(pageId);
    const validIds = new Set(blocks.map(block => block.id));
    const updates = orderedIds
      .filter(id => validIds.has(id))
      .map((id, index) => contentBlockRepository.update(id, { position: index }));

    await Promise.all(updates);

    res.status(200).json({ success: true, message: "Blocks reordered" });
  }
}

export const contentBlockController = new ContentBlockController();
