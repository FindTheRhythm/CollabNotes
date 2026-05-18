import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  setNotebooks,
  setCurrentNotebook,
  addNotebook,
  updateNotebook,
  deleteNotebook,
} from "@/store/notebookSlice";
import { notebookAPI } from "@/api/notebookAPI";
import { workspaceAPI } from "@/api/workspaceAPI";

export const useNotebookManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );
  const { notebooks, currentNotebook } = useSelector(
    (state: RootState) => state.notebook
  );

  const loadNotebooks = useCallback(async () => {
    if (!currentWorkspace) return;
    try {
      const data = await notebookAPI.getNotebooks(currentWorkspace.id);
      dispatch(setNotebooks(data));
      if (!currentNotebook && data.length > 0) {
        dispatch(setCurrentNotebook(data[0]));
      }
    } catch (error) {
      console.error("Failed to load notebooks:", error);
    }
  }, [currentWorkspace, currentNotebook, dispatch]);

  const selectNotebook = useCallback(
    async (notebookId: string) => {
      try {
        const notebook = await notebookAPI.getNotebook(notebookId);
        dispatch(setCurrentNotebook(notebook));
      } catch (error) {
        console.error("Failed to load notebook:", error);
      }
    },
    [dispatch]
  );

  const createNotebook = useCallback(
    async (name: string, description?: string) => {
      let workspaceId = currentWorkspace?.id;
      if (!workspaceId) {
        console.warn('[useNotebookManagement] currentWorkspace is empty, fetching workspaces as fallback');
        try {
          // force fresh fetch to avoid 304 Not Modified cached responses
          const w = await workspaceAPI.getWorkspaces(true);
          if (w && w.length > 0) {
            workspaceId = w[0].id;
            console.log('[useNotebookManagement] fallback workspaceId', workspaceId);
          } else {
            console.error('[useNotebookManagement] no workspaces available to create notebook');
            return;
          }
        } catch (err) {
          console.error('[useNotebookManagement] failed to fetch workspaces fallback', err);
          return;
        }
      }
      try {
        console.log('[useNotebookManagement] creating notebook', { workspaceId, name });
        const newNotebook = await notebookAPI.createNotebook(
          workspaceId,
          {
            name,
            description,
            color: "#007AFF",
          }
        );
        console.log('[useNotebookManagement] createNotebook response', newNotebook);
        dispatch(addNotebook(newNotebook));
        dispatch(setCurrentNotebook(newNotebook));
        return newNotebook;
      } catch (error) {
        console.error("Failed to create notebook:", error);
      }
    },
    [currentWorkspace, dispatch]
  );

  const renameNotebook = useCallback(
    async (notebookId: string, newName: string) => {
      try {
        const updated = await notebookAPI.updateNotebook(notebookId, {
          name: newName,
        });
        dispatch(updateNotebook(updated));
      } catch (error) {
        console.error("Failed to rename notebook:", error);
      }
    },
    [dispatch]
  );

  const removeNotebook = useCallback(
    async (notebookId: string) => {
      try {
        await notebookAPI.deleteNotebook(notebookId);
        dispatch(deleteNotebook(notebookId));
      } catch (error) {
        console.error("Failed to delete notebook:", error);
      }
    },
    [dispatch]
  );

  const reorderNotebooks = useCallback(
    async (orderedIds: string[]) => {
      try {
        const updated = await notebookAPI.reorderNotebooks(orderedIds);
        dispatch(setNotebooks(updated));
      } catch (error) {
        console.error('Failed to reorder notebooks', error);
      }
    },
    [dispatch]
  );

  return {
    notebooks,
    currentNotebook,
    loadNotebooks,
    selectNotebook,
    createNotebook,
    renameNotebook,
    removeNotebook,
    reorderNotebooks,
  };
};
