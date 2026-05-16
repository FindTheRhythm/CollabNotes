import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Page {
  id: string;
  sectionId: string;
  notebookId: string;
  title: string;
  content: string;
  position: number;
  author: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  lastModifiedBy?: string;
  syncStatus: "synced" | "syncing" | "error";
}

export interface PageState {
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;
  error: string | null;
  autoSaveTimeout: ReturnType<typeof setTimeout> | null;
}

const initialState: PageState = {
  pages: [],
  currentPage: null,
  loading: false,
  error: null,
  autoSaveTimeout: null,
};

const pageSlice = createSlice({
  name: "page",
  initialState,
  reducers: {
    setPages: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<Page | null>) => {
      state.currentPage = action.payload;
    },
    addPage: (state, action: PayloadAction<Page>) => {
      state.pages.push(action.payload);
    },
    updatePage: (state, action: PayloadAction<Page>) => {
      const index = state.pages.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.pages[index] = action.payload;
      }
      if (state.currentPage?.id === action.payload.id) {
        state.currentPage = action.payload;
      }
    },
    updatePageContent: (
      state,
      action: PayloadAction<{ pageId: string; content: string }>
    ) => {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (page) {
        page.content = action.payload.content;
        page.syncStatus = "syncing";
      }
      if (state.currentPage?.id === action.payload.pageId) {
        state.currentPage.content = action.payload.content;
        state.currentPage.syncStatus = "syncing";
      }
    },
    updatePageSyncStatus: (
      state,
      action: PayloadAction<{ pageId: string; status: Page["syncStatus"] }>
    ) => {
      const page = state.pages.find((p) => p.id === action.payload.pageId);
      if (page) {
        page.syncStatus = action.payload.status;
      }
      if (state.currentPage?.id === action.payload.pageId) {
        state.currentPage.syncStatus = action.payload.status;
      }
    },
    deletePage: (state, action: PayloadAction<string>) => {
      state.pages = state.pages.filter((p) => p.id !== action.payload);
      if (state.currentPage?.id === action.payload) {
        state.currentPage = null;
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const page = state.pages.find((p) => p.id === action.payload);
      if (page) {
        page.isFavorite = !page.isFavorite;
      }
      if (state.currentPage?.id === action.payload) {
        state.currentPage.isFavorite = !state.currentPage.isFavorite;
      }
    },
    reorderPages: (state, action: PayloadAction<Page[]>) => {
      state.pages = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPages,
  setCurrentPage,
  addPage,
  updatePage,
  updatePageContent,
  updatePageSyncStatus,
  deletePage,
  toggleFavorite,
  reorderPages,
  setLoading,
  setError,
} = pageSlice.actions;

export default pageSlice.reducer;
