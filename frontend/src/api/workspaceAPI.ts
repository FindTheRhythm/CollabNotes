import axios from "axios";
import { Workspace } from "@/store/workspaceSlice";

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

export const workspaceAPI = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await api.get("/workspaces");
    return response.data.data;
  },

  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data.data;
  },

  createWorkspace: async (data: {
    name: string;
    description?: string;
  }): Promise<Workspace> => {
    const response = await api.post("/workspaces", data);
    return response.data.data;
  },

  updateWorkspace: async (
    workspaceId: string,
    data: {
      name?: string;
      description?: string;
    }
  ): Promise<Workspace> => {
    const response = await api.put(`/workspaces/${workspaceId}`, data);
    return response.data.data;
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  getMembers: async (workspaceId: string) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data.data;
  },

  addMember: async (
    workspaceId: string,
    userId: string,
    role: string
  ): Promise<void> => {
    await api.post(`/workspaces/${workspaceId}/members`, {
      userId,
      role,
    });
  },

  removeMember: async (workspaceId: string, userId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
  },
};

export default api;
