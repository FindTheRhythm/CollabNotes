import axios from "axios";
import { Section } from "@/store/sectionSlice";

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

export const sectionAPI = {
  getSections: async (notebookId: string): Promise<Section[]> => {
    const response = await api.get(`/sections?notebookId=${notebookId}`);
    return response.data.data;
  },

  getSection: async (sectionId: string): Promise<Section> => {
    const response = await api.get(`/sections/${sectionId}`);
    return response.data.data;
  },

  createSection: async (
    notebookId: string,
    data: {
      name: string;
      color?: string;
      position: number;
    }
  ): Promise<Section> => {
    const response = await api.post("/sections", {
      notebookId,
      ...data,
    });
    return response.data.data;
  },

  updateSection: async (
    sectionId: string,
    data: {
      name?: string;
      color?: string;
      position?: number;
    }
  ): Promise<Section> => {
    const response = await api.put(`/sections/${sectionId}`, data);
    return response.data.data;
  },

  deleteSection: async (sectionId: string): Promise<void> => {
    await api.delete(`/sections/${sectionId}`);
  },

  reorderSections: async (
    sectionIds: string[]
  ): Promise<Section[]> => {
    const response = await api.put("/sections/reorder", {
      sectionIds,
    });
    return response.data.data;
  },
};

export default api;
