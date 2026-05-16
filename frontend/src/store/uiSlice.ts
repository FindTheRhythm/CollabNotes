import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  theme: "light" | "dark";
  sidebarCollapsed: boolean;
  notebookPanelWidth: number;
  sectionPagePanelWidth: number;
  showComments: boolean;
  showVersionHistory: boolean;
  commandPaletteOpen: boolean;
  searchOpen: boolean;
  searchQuery: string;
  notifications: Array<{
    id: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    duration?: number;
  }>;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    items: Array<{
      label: string;
      action: string;
      icon?: string;
    }>;
  };
}

const isBrowser = typeof localStorage !== "undefined";
const initialTheme = isBrowser ? (localStorage.getItem("theme") as "light" | "dark") || "light" : "light";

const initialState: UIState = {
  theme: initialTheme,
  sidebarCollapsed: false,
  notebookPanelWidth: 250,
  sectionPagePanelWidth: 280,
  showComments: false,
  showVersionHistory: false,
  commandPaletteOpen: false,
  searchOpen: false,
  searchQuery: "",
  notifications: [],
  contextMenu: {
    visible: false,
    x: 0,
    y: 0,
    items: [],
  },
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setNotebookPanelWidth: (state, action: PayloadAction<number>) => {
      state.notebookPanelWidth = action.payload;
    },
    setSectionPagePanelWidth: (state, action: PayloadAction<number>) => {
      state.sectionPagePanelWidth = action.payload;
    },
    toggleComments: (state) => {
      state.showComments = !state.showComments;
    },
    toggleVersionHistory: (state) => {
      state.showVersionHistory = !state.showVersionHistory;
    },
    openCommandPalette: (state) => {
      state.commandPaletteOpen = true;
    },
    closeCommandPalette: (state) => {
      state.commandPaletteOpen = false;
    },
    openSearch: (state) => {
      state.searchOpen = true;
    },
    closeSearch: (state) => {
      state.searchOpen = false;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<{
        message: string;
        type: "info" | "success" | "warning" | "error";
        duration?: number;
      }>
    ) => {
      state.notifications.push({
        id: Math.random().toString(36),
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    showContextMenu: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        items: Array<{ label: string; action: string; icon?: string }>;
      }>
    ) => {
      state.contextMenu = {
        visible: true,
        ...action.payload,
      };
    },
    hideContextMenu: (state) => {
      state.contextMenu.visible = false;
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setNotebookPanelWidth,
  setSectionPagePanelWidth,
  toggleComments,
  toggleVersionHistory,
  openCommandPalette,
  closeCommandPalette,
  openSearch,
  closeSearch,
  setSearchQuery,
  addNotification,
  removeNotification,
  showContextMenu,
  hideContextMenu,
} = uiSlice.actions;

export default uiSlice.reducer;
