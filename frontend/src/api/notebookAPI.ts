import axios from "axios";
import { Notebook } from "@/store/notebookSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const notebookAPI = {
  getNotebooks: async (workspaceId: string): Promise<Notebook[]> => {
    const response = await api.get(`/notebooks?workspaceId=${workspaceId}`);
    return response.data.data;
  },

  getNotebook: async (notebookId: string): Promise<Notebook> => {
    const response = await api.get(`/notebooks/${notebookId}`);
    return response.data.data;
  },

  createNotebook: async (
    workspaceId: string,
    data: {
      name: string;
      description?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<Notebook> => {
    const response = await api.post("/notebooks", {
      workspaceId,
      ...data,
    });
    return response.data.data;
  },

  updateNotebook: async (
    notebookId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    }
  ): Promise<Notebook> => {
    const response = await api.put(`/notebooks/${notebookId}`, data);
    return response.data.data;
  },

  deleteNotebook: async (notebookId: string): Promise<void> => {
    await api.delete(`/notebooks/${notebookId}`);
  },

  duplicateNotebook: async (notebookId: string): Promise<Notebook> => {
    const response = await api.post(`/notebooks/${notebookId}/duplicate`);
    return response.data.data;
  },

  archiveNotebook: async (notebookId: string): Promise<Notebook> => {
    const response = await api.patch(`/notebooks/${notebookId}/archive`);
    return response.data.data;
  },

  shareNotebook: async (
    notebookId: string,
    userId: string,
    permission: "view" | "edit"
  ): Promise<void> => {
    await api.post(`/notebooks/${notebookId}/share`, {
      userId,
      permission,
    });
  },

  reorderNotebooks: async (
    notebookIds: string[]
  ): Promise<Notebook[]> => {
    const response = await api.put("/notebooks/reorder", {
      notebookIds,
    });
    return response.data.data;
  },
};

export default api;
