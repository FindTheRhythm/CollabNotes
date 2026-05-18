import axios from "axios";
import { Page } from "@/store/pageSlice";

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

export const pageAPI = {
  getPages: async (sectionId?: string, notebookId?: string): Promise<Page[]> => {
    const params = new URLSearchParams();
    if (sectionId) {
      params.append('sectionId', sectionId);
    }
    if (notebookId) {
      params.append('notebookId', notebookId);
    }
    const response = await api.get(`/pages?${params.toString()}`);
    return response.data.data;
  },

  getPage: async (pageId: string): Promise<Page> => {
    const response = await api.get(`/pages/${pageId}`);
    return response.data.data;
  },

  createPage: async (
    sectionIdOrNotebookId: string,
    data: {
      title: string;
      content: string;
      position: number;
    },
    isSectionId: boolean = true
  ): Promise<Page> => {
    const response = await api.post("/pages", {
      [isSectionId ? 'sectionId' : 'notebookId']: sectionIdOrNotebookId,
      ...data,
    });
    return response.data.data;
  },

  updatePage: async (
    pageId: string,
    data: {
      title?: string;
      content?: string;
      position?: number;
    }
  ): Promise<Page> => {
    const response = await api.put(`/pages/${pageId}`, data);
    return response.data.data;
  },

  deletePage: async (pageId: string): Promise<void> => {
    await api.delete(`/pages/${pageId}`);
  },

  duplicatePage: async (pageId: string): Promise<Page> => {
    const response = await api.post(`/pages/${pageId}/duplicate`);
    return response.data.data;
  },

  movePage: async (
    pageId: string,
    sectionId: string,
    position: number
  ): Promise<Page> => {
    const response = await api.patch(`/pages/${pageId}`, {
      sectionId,
      position,
    });
    return response.data.data;
  },

  searchPages: async (query: string): Promise<Page[]> => {
    const response = await api.get("/pages/search", {
      params: { q: query },
    });
    return response.data.data;
  },

  getPageVersions: async (pageId: string) => {
    const response = await api.get(`/pages/${pageId}/versions`);
    return response.data.data;
  },

  restorePageVersion: async (pageId: string, versionId: string): Promise<Page> => {
    const response = await api.post(
      `/pages/${pageId}/versions/${versionId}/restore`
    );
    return response.data.data;
  },
};

export default api;
