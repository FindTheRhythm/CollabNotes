import api from "@/api/client";
import { Workspace } from "@/store/workspaceSlice";

export const workspaceAPI = {
  getWorkspaces: async (force = false): Promise<Workspace[]> => {
    const config: any = {};
    if (force) {
      config.params = { _t: Date.now() };
      config.headers = { "Cache-Control": "no-cache" };
    }
    const response = await api.get("/workspaces", config);
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

export default workspaceAPI;
