import api from "@/api/client";
import { IAuthResponse, IUser } from "@/types/index";

const log = {
  info: (msg: string, data?: any) => console.log(`[AUTH API] ${msg}`, data || ""),
  error: (msg: string, data?: any) => console.error(`[AUTH API ERROR] ${msg}`, data || ""),
  debug: (msg: string, data?: any) => console.log(`[AUTH API DEBUG] ${msg}`, data || ""),
};

export const authAPI = {
  register: async (email: string, username: string, password: string): Promise<IAuthResponse> => {
    try {
      log.info("POST /auth/register", { email, username });
      const response = await api.post("/auth/register", { email, username, password });
      log.info("POST /auth/register success", { userId: response.data.data.user.id });
      return response.data.data;
    } catch (error: any) {
      log.error("POST /auth/register failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
        errorData: error.response?.data
      });
      throw error;
    }
  },

  login: async (email: string, password: string): Promise<IAuthResponse> => {
    try {
      log.info("POST /auth/login", { email });
      const response = await api.post("/auth/login", { email, password });
      log.info("POST /auth/login success", { userId: response.data.data.user.id });
      return response.data.data;
    } catch (error: any) {
      log.error("POST /auth/login failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
        errorData: error.response?.data
      });
      throw error;
    }
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      log.info("POST /auth/logout");
      await api.post("/auth/logout", { refreshToken });
      log.info("POST /auth/logout success");
    } catch (error: any) {
      log.error("POST /auth/logout failed", {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      throw error;
    }
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
    try {
      log.info("POST /auth/refresh");
      const response = await api.post("/auth/refresh", { refreshToken });
      log.info("POST /auth/refresh success");
      return response.data.data;
    } catch (error: any) {
      log.error("POST /auth/refresh failed", {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      throw error;
    }
  },

  updateUser: async (id: string, updates: { username?: string; email?: string }): Promise<IUser> => {
    try {
      log.info("PUT /users/" + id, updates);
      const response = await api.put(`/users/${id}`, updates);
      log.info("PUT /users/" + id + " success", { userId: response.data.data.id });
      return response.data.data;
    } catch (error: any) {
      log.error("PUT /users/" + id + " failed", {
        status: error.response?.status,
        message: error.response?.data?.message,
        errorData: error.response?.data
      });
      throw error;
    }
  },

  getCurrentUser: async (): Promise<IUser> => {
    try {
      log.info("GET /auth/me");
      const response = await api.get("/auth/me");
      log.info("GET /auth/me success", { userId: response.data.data.id });
      return response.data.data;
    } catch (error: any) {
      log.error("GET /auth/me failed", {
        status: error.response?.status,
        message: error.response?.data?.message
      });
      throw error;
    }
  }
};
