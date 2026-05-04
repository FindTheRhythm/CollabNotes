import api from "@/api/client.ts";
import { IUser, IPaginatedResponse } from "@/types/index.ts";

export const userAPI = {
  getAll: async (page: number = 1, limit: number = 20): Promise<IPaginatedResponse<IUser>> => {
    const response = await api.get("/users", { params: { page, limit } });
    return response.data.data;
  },

  getById: async (id: string): Promise<IUser> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  update: async (id: string, updates: Partial<IUser>): Promise<IUser> => {
    const response = await api.put(`/users/${id}`, updates);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};
