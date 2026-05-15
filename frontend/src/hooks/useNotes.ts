import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/index";
import { setLoading, setError, setNotes, setCurrentNote, addNote, updateNote, deleteNote } from "@/store/noteSlice";
import { noteAPI } from "@/api/note";

export function useNotes() {
  const dispatch = useDispatch<AppDispatch>();
  const notes = useSelector((state: RootState) => state.notes);

  const fetchNotes = async (page: number = 1, limit: number = 20): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const result = await noteAPI.getAll(page, limit);
      dispatch(setNotes({
        notes: result.data,
        pagination: result.pagination
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch notes";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchNoteById = async (id: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const note = await noteAPI.getById(id);
      dispatch(setCurrentNote(note));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch note";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchUserNotes = async (page: number = 1, limit: number = 20): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const result = await noteAPI.getUserNotes(page, limit);
      dispatch(setNotes({
        notes: result.data,
        pagination: result.pagination
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch user notes";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createNote = async (title: string, content: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const note = await noteAPI.create(title, content);
      dispatch(addNote(note));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to create note";
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const updateNoteContent = async (id: string, title?: string, content?: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const note = await noteAPI.update(id, title, content);
      dispatch(updateNote(note));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to update note";
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const removeNote = async (id: string): Promise<void> => {
    dispatch(setLoading(true));
    try {
      await noteAPI.delete(id);
      dispatch(deleteNote(id));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to delete note";
      dispatch(setError(message));
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const searchNotes = async (query: string, page: number = 1, limit: number = 20): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const result = await noteAPI.search(query, page, limit);
      dispatch(setNotes({
        notes: result.data,
        pagination: result.pagination
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to search notes";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    ...notes,
    fetchNotes,
    fetchNoteById,
    fetchUserNotes,
    createNote,
    updateNoteContent,
    removeNote,
    searchNotes
  };
}
