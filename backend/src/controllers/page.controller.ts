import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { pageService } from "../services/page.service.js";
import { pageRepository } from "../repositories/page.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { createSuccessResponse } from "../utils/errors.js";

class PageController {
  saveVersion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const { content } = req.body;

    if (!content || typeof content !== 'string') {
      res.status(400).json(createSuccessResponse(null, 'content is required', 400));
      return;
    }

    // Authorization: ensure user owns the notebook or is ADMIN
    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');

    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');

    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    if (!isOwner && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to save this page');
    }

    const version = await pageService.savePageVersion(pageId, content);

    res.status(201).json(createSuccessResponse(version, 'Page version saved', 201));
  });

  getLatest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const content = await pageService.getLatestContent(pageId);
    res.status(200).json(createSuccessResponse({ content }, 'Latest content retrieved', 200));
  });

  listVersions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');

    const versions = await pageService.getVersions(pageId);
    res.status(200).json(createSuccessResponse(versions, 'Versions retrieved', 200));
  });

  restoreVersion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const versionId = req.params.versionId;

    // Authorization check (owner or admin)
    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');
    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    if (!isOwner && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to restore this page');
    }

    const restored = await pageService.restoreVersion(pageId, versionId);
    res.status(200).json(createSuccessResponse(restored, 'Version restored', 200));
  });

  authorizeAccess = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const permission = ((req.query.permission as string) || 'view').toLowerCase();

    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');

    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');

    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canView = isOwner || userRole === 'ADMIN';
    const canEdit = canView;

    if (permission === 'edit' && !canEdit) {
      throw new ForbiddenError('You do not have edit permission for this page');
    }
    if (permission === 'view' && !canView) {
      throw new ForbiddenError('You do not have view permission for this page');
    }

    res.status(200).json(createSuccessResponse({ canView, canEdit }, 'Page access authorized', 200));
  });

  movePages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sectionId, orderedIds } = req.body as { sectionId: string; orderedIds: string[] };
    if (!sectionId || !Array.isArray(orderedIds)) {
      res.status(400).json(createSuccessResponse(null, 'sectionId and orderedIds are required', 400));
      return;
    }

    // Authorization: check section -> notebook ownership
    const section = await sectionRepository.findById(sectionId);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    if (!isOwner && userRole !== 'ADMIN') {
      throw new ForbiddenError('You do not have permission to reorder pages in this section');
    }

    // Update positions
    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      await pageRepository.update(id, { position: i, section_id: sectionId });
    }

    res.status(200).json(createSuccessResponse(null, 'Pages reordered', 200));
  });

  search = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const offset = (page - 1) * limit;

    if (!q || typeof q !== 'string') {
      res.status(400).json(createSuccessResponse(null, 'Query is required', 400));
      return;
    }

    const result = await pageService.search(q, offset, limit);
    res.status(200).json(createSuccessResponse(result, 'Search results', 200));
  });
}

export const pageController = new PageController();
