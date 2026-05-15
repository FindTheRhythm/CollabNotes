import api from "@/api/client";
import { ISharedAccess } from "@/types/index";

export const accessAPI = {
  share: async (noteId: string, userId: string, permission: string): Promise<ISharedAccess> => {
    const response = await api.post("/access/share", { noteId, userId, permission });
    return response.data.data;
  },

  getAccessList: async (noteId: string): Promise<ISharedAccess[]> => {
    const response = await api.get(`/access/${noteId}`);
    return response.data.data;
  },

  update: async (id: string, permission: string): Promise<ISharedAccess> => {
    const response = await api.put(`/access/${id}`, { permission });
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/access/${id}`);
  }
};
