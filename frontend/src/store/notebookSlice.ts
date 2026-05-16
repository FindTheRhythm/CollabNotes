import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notebook {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  owner: string;
  collaborators: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookState {
  notebooks: Notebook[];
  currentNotebook: Notebook | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotebookState = {
  notebooks: [],
  currentNotebook: null,
  loading: false,
  error: null,
};

const notebookSlice = createSlice({
  name: "notebook",
  initialState,
  reducers: {
    setNotebooks: (state, action: PayloadAction<Notebook[]>) => {
      state.notebooks = action.payload;
    },
    setCurrentNotebook: (state, action: PayloadAction<Notebook>) => {
      state.currentNotebook = action.payload;
    },
    addNotebook: (state, action: PayloadAction<Notebook>) => {
      state.notebooks.push(action.payload);
    },
    updateNotebook: (state, action: PayloadAction<Notebook>) => {
      const index = state.notebooks.findIndex(
        (nb) => nb.id === action.payload.id
      );
      if (index !== -1) {
        state.notebooks[index] = action.payload;
      }
      if (state.currentNotebook?.id === action.payload.id) {
        state.currentNotebook = action.payload;
      }
    },
    deleteNotebook: (state, action: PayloadAction<string>) => {
      state.notebooks = state.notebooks.filter(
        (nb) => nb.id !== action.payload
      );
      if (state.currentNotebook?.id === action.payload) {
        state.currentNotebook = null;
      }
    },
    reorderNotebooks: (state, action: PayloadAction<Notebook[]>) => {
      state.notebooks = action.payload;
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
  setNotebooks,
  setCurrentNotebook,
  addNotebook,
  updateNotebook,
  deleteNotebook,
  reorderNotebooks,
  setLoading,
  setError,
} = notebookSlice.actions;

export default notebookSlice.reducer;
