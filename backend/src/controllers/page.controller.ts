import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { pageService } from "../services/page.service.js";
import { pageRepository } from "../repositories/page.repository.js";
import { sectionRepository } from "../repositories/section.repository.js";
import { notebookRepository } from "../repositories/notebook.repository.js";
import { accessService } from "../services/access.service.js";
import { AccessPermission, AccessResourceType } from "../types/index.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { createSuccessResponse } from "../utils/errors.js";

class PageController {
  // Get pages by section or notebook
  getPages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sectionId, notebookId } = req.query;
    
    if (!sectionId && !notebookId) {
      res.status(400).json(createSuccessResponse(null, 'Either sectionId or notebookId query parameter is required', 400));
      return;
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;

    let pages = [];
    let authorizedNotebook = null;

    if (sectionId && typeof sectionId === 'string') {
      // Get pages by section
      const section = await sectionRepository.findById(sectionId);
      if (!section) throw new NotFoundError('Section not found');
      const notebook = await notebookRepository.findById(section.notebook_id);
      if (!notebook) throw new NotFoundError('Notebook not found');
      const isOwner = notebook.owner_id === userId;
      const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
        AccessResourceType.NOTEBOOK,
        notebook.id,
        userId,
        AccessPermission.READ,
        userRole
      );
      if (!canView) {
        throw new ForbiddenError('You do not have permission to view pages in this section');
      }
      pages = await pageRepository.findBySectionId(sectionId);
      authorizedNotebook = notebook;
    } else if (notebookId && typeof notebookId === 'string') {
      // Get all pages in notebook (from all sections)
      const notebook = await notebookRepository.findById(notebookId);
      if (!notebook) throw new NotFoundError('Notebook not found');
      const isOwner = notebook.owner_id === userId;
      const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
        AccessResourceType.NOTEBOOK,
        notebook.id,
        userId,
        AccessPermission.READ,
        userRole
      );
      if (!canView) {
        throw new ForbiddenError('You do not have permission to view pages in this notebook');
      }
      // Get all sections in notebook
      const sections = await sectionRepository.findByNotebookId(notebookId);
      // Get all pages from all sections
      for (const section of sections) {
        const sectionPages = await pageRepository.findBySectionId(section.id);
        pages.push(...sectionPages);
      }
      authorizedNotebook = notebook;
    }

    res.status(200).json(createSuccessResponse(pages, 'Pages retrieved', 200));
  });

  // Get single page
  getPage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');

    // Authorization: check section -> notebook ownership
    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.READ,
      userRole
    );
    if (!canView) {
      throw new ForbiddenError('You do not have permission to view this page');
    }

    const latestContent = await pageService.getLatestContent(id);
    const pageWithContent = {
      ...page,
      content: latestContent ?? "",
    };

    res.status(200).json(createSuccessResponse(pageWithContent, 'Page retrieved', 200));
  });

  // Create page
  createPage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { sectionId, notebookId, title, content, position } = req.body;

    if (!title) {
      res.status(400).json(createSuccessResponse(null, 'title is required', 400));
      return;
    }

    if (!sectionId && !notebookId) {
      res.status(400).json(createSuccessResponse(null, 'Either sectionId or notebookId is required', 400));
      return;
    }

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    let effectiveSectionId = sectionId;

    if (notebookId) {
      // Get first section of notebook
      const sections = await sectionRepository.findByNotebookId(notebookId);
      if (sections.length === 0) throw new NotFoundError('No sections found in notebook');
      effectiveSectionId = sections[0].id;
      
      // Authorize notebook access
      const notebook = await notebookRepository.findById(notebookId);
      if (!notebook) throw new NotFoundError('Notebook not found');
      const isOwner = notebook.owner_id === userId;
      const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
        AccessResourceType.NOTEBOOK,
        notebook.id,
        userId,
        AccessPermission.WRITE,
        userRole
      );
      if (!canEdit) {
        throw new ForbiddenError('You do not have permission to create pages in this notebook');
      }
    } else {
      // Authorization: check section -> notebook ownership
      const section = await sectionRepository.findById(sectionId!);
      if (!section) throw new NotFoundError('Section not found');
      const notebook = await notebookRepository.findById(section.notebook_id);
      if (!notebook) throw new NotFoundError('Notebook not found');
      const isOwner = notebook.owner_id === userId;
      const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
        AccessResourceType.NOTEBOOK,
        notebook.id,
        userId,
        AccessPermission.WRITE,
        userRole
      );
      if (!canEdit) {
        throw new ForbiddenError('You do not have permission to create pages in this section');
      }
    }

    const pagePosition = typeof position === 'number' ? position : 0;
    const page = await pageRepository.create(title, effectiveSectionId, pagePosition, content);

    // Save initial content if provided
    if (content && typeof content === 'string') {
      await pageService.savePageVersion(page.id, content);
    }

    const latestContent = await pageService.getLatestContent(page.id);
    const pageWithContent = {
      ...page,
      content: latestContent ?? "",
    };

    res.status(201).json(createSuccessResponse(pageWithContent, 'Page created', 201));
  });

  // Update page
  updatePage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { title, position, content } = req.body;

    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');

    // Authorization: check section -> notebook ownership
    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );
    if (!canEdit) {
      throw new ForbiddenError('You do not have permission to update this page');
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (position !== undefined) updates.position = position;

    const updated = await pageRepository.update(id, updates);

    if (content !== undefined && typeof content === 'string') {
      await pageService.savePageVersion(id, content);
    }

    const latestContent = await pageService.getLatestContent(id);
    const pageWithContent = {
      ...updated,
      content: latestContent ?? "",
    };

    res.status(200).json(createSuccessResponse(pageWithContent, 'Page updated', 200));
  });

  // Delete page
  deletePage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const page = await pageRepository.findById(id);
    if (!page) throw new NotFoundError('Page not found');

    // Authorization: check section -> notebook ownership
    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );
    if (!canEdit) {
      throw new ForbiddenError('You do not have permission to delete this page');
    }

    await pageRepository.delete(id);
    res.status(200).json(createSuccessResponse(null, 'Page deleted', 200));
  });

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
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );
    if (!canEdit) {
      throw new ForbiddenError('You do not have permission to save this page');
    }

    const version = await pageService.savePageVersion(pageId, content);

    res.status(201).json(createSuccessResponse(version, 'Page version saved', 201));
  });

  getLatest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');

    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.READ,
      userRole
    );
    if (!canView) {
      throw new ForbiddenError('You do not have permission to view this page');
    }

    const content = await pageService.getLatestContent(pageId);
    res.status(200).json(createSuccessResponse({ content }, 'Latest content retrieved', 200));
  });

  listVersions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const pageId = req.params.id;
    const page = await pageRepository.findById(pageId);
    if (!page) throw new NotFoundError('Page not found');

    const section = await sectionRepository.findById(page.section_id);
    if (!section) throw new NotFoundError('Section not found');
    const notebook = await notebookRepository.findById(section.notebook_id);
    if (!notebook) throw new NotFoundError('Notebook not found');

    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const isOwner = notebook.owner_id === userId;
    const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.READ,
      userRole
    );
    if (!canView) {
      throw new ForbiddenError('You do not have permission to view this page');
    }

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
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );
    if (!canEdit) {
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
    const canView = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.READ,
      userRole
    );
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );

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
    const canEdit = isOwner || userRole === 'ADMIN' || await accessService.canAccess(
      AccessResourceType.NOTEBOOK,
      notebook.id,
      userId,
      AccessPermission.WRITE,
      userRole
    );

    if (!canEdit) {
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
