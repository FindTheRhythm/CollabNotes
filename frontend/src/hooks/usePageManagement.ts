import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  setPages,
  setCurrentPage,
  addPage,
  deletePage as deletePageAction,
  updatePageSyncStatus,
  toggleFavorite,
} from "@/store/pageSlice";
import { pageAPI } from "@/api/pageAPI";

export const usePageManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentPage, pages } = useSelector((state: RootState) => state.page);
  const { currentNotebook } = useSelector(
    (state: RootState) => state.notebook
  );

  const loadPages = useCallback(async () => {
    if (!currentNotebook) return;
    try {
      console.log('[usePageManagement] loadPages called for notebook:', { notebookId: currentNotebook.id });
      const data = await pageAPI.getPages(undefined, currentNotebook.id);
      console.log('[usePageManagement] Pages loaded:', { count: data.length, pages: data });
      dispatch(setPages(data));
    } catch (error) {
      console.error("Failed to load pages:", error);
    }
  }, [currentNotebook, dispatch]);

  const loadPage = useCallback(
    async (pageId: string) => {
      try {
        const page = await pageAPI.getPage(pageId);
        dispatch(setCurrentPage(page));
      } catch (error) {
        console.error("Failed to load page:", error);
      }
    },
    [dispatch]
  );

  const savePage = useCallback(
    async (pageId: string, content: string) => {
      dispatch(updatePageSyncStatus({ pageId, status: "syncing" }));
      try {
        await pageAPI.updatePage(pageId, { content });
        dispatch(updatePageSyncStatus({ pageId, status: "synced" }));
      } catch (error) {
        console.error("Failed to save page:", error);
        dispatch(updatePageSyncStatus({ pageId, status: "error" }));
      }
    },
    [dispatch]
  );

  const createNewPage = useCallback(
    async (title: string) => {
      console.log('[usePageManagement] createNewPage called:', { title, currentNotebook });
      if (!currentNotebook) {
        console.error('[usePageManagement] createNewPage: currentNotebook is missing!');
        return;
      }
      try {
        console.log('[usePageManagement] Creating page with:', { notebookId: currentNotebook.id, title, position: pages.length });
        const newPage = await pageAPI.createPage(currentNotebook.id, {
          title,
          content: "",
          position: pages.length,
        }, false); // false = notebookId, not sectionId
        console.log('[usePageManagement] Page created successfully:', newPage);
        dispatch(addPage(newPage));
        dispatch(setCurrentPage(newPage));
        return newPage;
      } catch (error) {
        console.error("Failed to create page:", error);
        throw error;
      }
    },
    [currentNotebook, pages.length, dispatch]
  );

  const deletePage = useCallback(
    async (pageId: string) => {
      try {
        await pageAPI.deletePage(pageId);
        dispatch(deletePageAction(pageId));
        if (currentPage?.id === pageId) {
          dispatch(setCurrentPage(null));
        }
      } catch (error) {
        console.error("Failed to delete page:", error);
      }
    },
    [currentPage, dispatch]
  );

  const duplicatePage = useCallback(
    async (pageId: string) => {
      try {
        const duplicated = await pageAPI.duplicatePage(pageId);
        dispatch(addPage(duplicated));
        dispatch(setCurrentPage(duplicated));
        return duplicated;
      } catch (error) {
        console.error("Failed to duplicate page:", error);
      }
    },
    [dispatch]
  );

  const movePage = useCallback(
    async (pageId: string, targetIndex: number) => {
      if (!currentNotebook) return;
      try {
        const page = pages.find(p => p.id === pageId);
        if (page) {
          // Get section from page
          const sectionId = page.sectionId;
          await pageAPI.movePage(pageId, sectionId, targetIndex);
          // reload pages to refresh ordering
          await loadPages();
        }
      } catch (error) {
        console.error('Failed to move page', error);
      }
    },
    [currentNotebook, pages, loadPages]
  );

  const toggleFavoritePage = useCallback((pageId: string) => {
    dispatch(toggleFavorite(pageId));
  }, [dispatch]);

  return {
    currentPage,
    pages,
    loadPages,
    loadPage,
    savePage,
    createNewPage,
    deletePage,
    duplicatePage,
    toggleFavorite: toggleFavoritePage,
    movePage,
  };
};
