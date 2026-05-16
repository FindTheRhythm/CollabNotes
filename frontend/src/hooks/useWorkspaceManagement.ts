import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  setWorkspaces,
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
} from "@/store/workspaceSlice";
import { workspaceAPI } from "@/api/workspaceAPI";

export const useWorkspaceManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaces, currentWorkspace } = useSelector(
    (state: RootState) => state.workspace
  );

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await workspaceAPI.getWorkspaces();
      dispatch(setWorkspaces(data));
      if (!currentWorkspace && data.length > 0) {
        dispatch(setCurrentWorkspace(data[0]));
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    }
  }, [currentWorkspace, dispatch]);

  const selectWorkspace = useCallback(
    async (workspaceId: string) => {
      try {
        const workspace = await workspaceAPI.getWorkspace(workspaceId);
        dispatch(setCurrentWorkspace(workspace));
      } catch (error) {
        console.error("Failed to load workspace:", error);
      }
    },
    [dispatch]
  );

  const createWorkspace = useCallback(
    async (name: string, description?: string) => {
      try {
        const newWorkspace = await workspaceAPI.createWorkspace({
          name,
          description,
        });
        dispatch(addWorkspace(newWorkspace));
        dispatch(setCurrentWorkspace(newWorkspace));
        return newWorkspace;
      } catch (error) {
        console.error("Failed to create workspace:", error);
      }
    },
    [dispatch]
  );

  const renameWorkspace = useCallback(
    async (workspaceId: string, newName: string) => {
      try {
        const updated = await workspaceAPI.updateWorkspace(workspaceId, {
          name: newName,
        });
        dispatch(updateWorkspace(updated));
      } catch (error) {
        console.error("Failed to rename workspace:", error);
      }
    },
    [dispatch]
  );

  const removeWorkspace = useCallback(
    async (workspaceId: string) => {
      try {
        await workspaceAPI.deleteWorkspace(workspaceId);
        dispatch(deleteWorkspace(workspaceId));
      } catch (error) {
        console.error("Failed to delete workspace:", error);
      }
    },
    [dispatch]
  );

  return {
    workspaces,
    currentWorkspace,
    loadWorkspaces,
    selectWorkspace,
    createWorkspace,
    renameWorkspace,
    removeWorkspace,
  };
};
