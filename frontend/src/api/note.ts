import api from "@/api/client";
import { INoteWithAccess, IPaginatedResponse } from "@/types/index";

export const noteAPI = {
  getAll: async (page: number = 1, limit: number = 20): Promise<IPaginatedResponse<INoteWithAccess>> => {
    const response = await api.get("/notes", { params: { page, limit } });
    return response.data.data;
  },

  getById: async (id: string): Promise<INoteWithAccess> => {
    const response = await api.get(`/notes/${id}`);
    return response.data.data;
  },

  getUserNotes: async (page: number = 1, limit: number = 20): Promise<IPaginatedResponse<INoteWithAccess>> => {
    const response = await api.get("/notes/my", { params: { page, limit } });
    return response.data.data;
  },

  create: async (title: string, content: string): Promise<INoteWithAccess> => {
    const response = await api.post("/notes", { title, content });
    return response.data.data;
  },

  update: async (id: string, title?: string, content?: string): Promise<INoteWithAccess> => {
    const response = await api.put(`/notes/${id}`, { title, content });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  search: async (query: string, page: number = 1, limit: number = 20): Promise<IPaginatedResponse<INoteWithAccess>> => {
    const response = await api.get("/notes/search", { params: { q: query, page, limit } });
    return response.data.data;
  }
};
