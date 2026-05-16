import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import {
  addNotification,
  removeNotification,
  setTheme,
  toggleSidebar,
  openCommandPalette,
  closeCommandPalette,
  toggleComments,
  toggleVersionHistory,
} from "@/store/uiSlice";

export const useUIState = () => {
  const dispatch = useDispatch<AppDispatch>();
  const ui = useSelector((state: RootState) => state.ui);

  const showNotification = useCallback(
    (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info",
      duration?: number
    ) => {
      const id = Math.random().toString(36);
      dispatch(addNotification({ message, type, duration }));

      if (duration !== undefined && duration > 0) {
        setTimeout(() => {
          dispatch(removeNotification(id));
        }, duration);
      }

      return id;
    },
    [dispatch]
  );

  const toggleTheme = useCallback(() => {
    const newTheme = ui.theme === "dark" ? "light" : "dark";
    dispatch(setTheme(newTheme));
  }, [ui.theme, dispatch]);

  const openCommandPaletteAction = useCallback(() => {
    dispatch(openCommandPalette());
  }, [dispatch]);

  const closeCommandPaletteAction = useCallback(() => {
    dispatch(closeCommandPalette());
  }, [dispatch]);

  const toggleSidebarAction = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  const toggleCommentsPanel = useCallback(() => {
    dispatch(toggleComments());
  }, [dispatch]);

  const toggleVersionHistoryPanel = useCallback(() => {
    dispatch(toggleVersionHistory());
  }, [dispatch]);

  return {
    theme: ui.theme,
    sidebarCollapsed: ui.sidebarCollapsed,
    showComments: ui.showComments,
    showVersionHistory: ui.showVersionHistory,
    commandPaletteOpen: ui.commandPaletteOpen,
    searchOpen: ui.searchOpen,
    searchQuery: ui.searchQuery,
    notifications: ui.notifications,
    showNotification,
    toggleTheme,
    openCommandPalette: openCommandPaletteAction,
    closeCommandPalette: closeCommandPaletteAction,
    toggleSidebar: toggleSidebarAction,
    toggleComments: toggleCommentsPanel,
    toggleVersionHistory: toggleVersionHistoryPanel,
  };
};
