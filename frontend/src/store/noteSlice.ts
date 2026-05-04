import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { INoteWithAccess } from "@/types/index.ts";

interface NoteState {
  notes: INoteWithAccess[];
  currentNote: INoteWithAccess | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: NoteState = {
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  }
};

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setNotes: (state, action: PayloadAction<{ notes: INoteWithAccess[]; pagination: any }>) => {
      state.notes = action.payload.notes;
      state.pagination = action.payload.pagination;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentNote: (state, action: PayloadAction<INoteWithAccess | null>) => {
      state.currentNote = action.payload;
    },
    addNote: (state, action: PayloadAction<INoteWithAccess>) => {
      state.notes.unshift(action.payload);
    },
    updateNote: (state, action: PayloadAction<INoteWithAccess>) => {
      const index = state.notes.findIndex(n => n.id === action.payload.id);
      if (index !== -1) {
        state.notes[index] = action.payload;
      }
      if (state.currentNote?.id === action.payload.id) {
        state.currentNote = action.payload;
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload);
      if (state.currentNote?.id === action.payload) {
        state.currentNote = null;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const { setLoading, setError, setNotes, setCurrentNote, addNote, updateNote, deleteNote, clearError } = noteSlice.actions;
export default noteSlice.reducer;
