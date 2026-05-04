import api from "@/api/client.ts";
import { IAuthResponse, IUser } from "@/types/index.ts";

export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<IAuthResponse> => {
    const response = await api.post("/auth/register", { email, username, password });
    return response.data.data;
  },

  login: async (email: string, password: string): Promise<IAuthResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<IUser> => {
    const response = await api.get("/auth/me");
    return response.data.data;
  }
};
