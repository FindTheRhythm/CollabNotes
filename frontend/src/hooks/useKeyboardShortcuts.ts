import { useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  setTheme,
  toggleSidebar,
  openCommandPalette,
  closeCommandPalette,
} from "@/store/uiSlice";

interface KeyboardShortcuts {
  [key: string]: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Ctrl+K - Command Palette
      if (e.ctrlKey && key === "k") {
        e.preventDefault();
        dispatch(openCommandPalette());
      }

      // Ctrl+/ - Toggle Sidebar
      if (e.ctrlKey && key === "/") {
        e.preventDefault();
        dispatch(toggleSidebar());
      }

      // Ctrl+Shift+L - Toggle Theme
      if (e.ctrlKey && e.shiftKey && key === "l") {
        e.preventDefault();
        const currentTheme = localStorage.getItem("theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        dispatch(setTheme(newTheme as "light" | "dark"));
      }

      // Escape - Close Command Palette
      if (key === "escape") {
        dispatch(closeCommandPalette());
      }

      // Call custom shortcuts
      const shortcutKey = `${e.ctrlKey ? "ctrl+" : ""}${e.shiftKey ? "shift+" : ""}${e.altKey ? "alt+" : ""}${key}`;
      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey]();
      }
    },
    [dispatch, shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
};
