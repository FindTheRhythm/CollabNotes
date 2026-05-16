import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/authSlice";
import noteReducer from "@/store/noteSlice";
import workspaceReducer from "@/store/workspaceSlice";
import notebookReducer from "@/store/notebookSlice";
import sectionReducer from "@/store/sectionSlice";
import pageReducer from "@/store/pageSlice";
import uiReducer from "@/store/uiSlice";
import collaborationReducer from "@/store/collaborationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notes: noteReducer,
    workspace: workspaceReducer,
    notebook: notebookReducer,
    section: sectionReducer,
    page: pageReducer,
    ui: uiReducer,
    collaboration: collaborationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
