import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Section {
  id: string;
  notebookId: string;
  name: string;
  color?: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface SectionState {
  sections: Section[];
  currentSection: Section | null;
  loading: boolean;
  error: string | null;
}

const initialState: SectionState = {
  sections: [],
  currentSection: null,
  loading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: "section",
  initialState,
  reducers: {
    setSections: (state, action: PayloadAction<Section[]>) => {
      state.sections = action.payload;
    },
    setCurrentSection: (state, action: PayloadAction<Section | null>) => {
      state.currentSection = action.payload;
    },
    addSection: (state, action: PayloadAction<Section>) => {
      state.sections.push(action.payload);
    },
    updateSection: (state, action: PayloadAction<Section>) => {
      const index = state.sections.findIndex(
        (sec) => sec.id === action.payload.id
      );
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
      if (state.currentSection?.id === action.payload.id) {
        state.currentSection = action.payload;
      }
    },
    deleteSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(
        (sec) => sec.id !== action.payload
      );
      if (state.currentSection?.id === action.payload) {
        state.currentSection = null;
      }
    },
    reorderSections: (state, action: PayloadAction<Section[]>) => {
      state.sections = action.payload;
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
  setSections,
  setCurrentSection,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  setLoading,
  setError,
} = sectionSlice.actions;

export default sectionSlice.reducer;
