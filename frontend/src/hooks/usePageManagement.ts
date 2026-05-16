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
  const { currentSection } = useSelector(
    (state: RootState) => state.section
  );

  const loadPages = useCallback(async () => {
    if (!currentSection) return;
    try {
      const data = await pageAPI.getPages(currentSection.id);
      dispatch(setPages(data));
    } catch (error) {
      console.error("Failed to load pages:", error);
    }
  }, [currentSection, dispatch]);

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
      console.log('[usePageManagement] createNewPage called:', { title, currentSection });
      if (!currentSection) {
        console.error('[usePageManagement] createNewPage: currentSection is missing!');
        return;
      }
      try {
        console.log('[usePageManagement] Creating page with:', { sectionId: currentSection.id, title, position: pages.length });
        const newPage = await pageAPI.createPage(currentSection.id, {
          title,
          content: "",
          position: pages.length,
        });
        console.log('[usePageManagement] Page created successfully:', newPage);
        dispatch(addPage(newPage));
        dispatch(setCurrentPage(newPage));
        return newPage;
      } catch (error) {
        console.error("Failed to create page:", error);
        throw error;
      }
    },
    [currentSection, pages.length, dispatch]
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
  };
};
