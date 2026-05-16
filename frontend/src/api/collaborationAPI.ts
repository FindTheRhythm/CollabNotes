import axios from "axios";
import { Comment } from "@/store/collaborationSlice";

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

export const collaborationAPI = {
  // Comments
  getPageComments: async (pageId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments?pageId=${pageId}`);
    return response.data.data;
  },

  getComment: async (commentId: string): Promise<Comment> => {
    const response = await api.get(`/comments/${commentId}`);
    return response.data.data;
  },

  createComment: async (data: {
    pageId: string;
    userId: string;
    content: string;
    blockId?: string;
  }): Promise<Comment> => {
    const response = await api.post("/comments", data);
    return response.data.data;
  },

  updateComment: async (
    commentId: string,
    data: { content?: string; resolved?: boolean }
  ): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, data);
    return response.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/comments/${commentId}`);
  },

  addReply: async (
    commentId: string,
    data: {
      userId: string;
      content: string;
    }
  ): Promise<Comment> => {
    const response = await api.post(
      `/comments/${commentId}/replies`,
      data
    );
    return response.data.data;
  },

  // Access Control
  sharePageWithUser: async (
    pageId: string,
    userId: string,
    permission: "view" | "edit" | "comment"
  ): Promise<void> => {
    await api.post(`/pages/${pageId}/share`, {
      userId,
      permission,
    });
  },

  revokeAccess: async (pageId: string, userId: string): Promise<void> => {
    await api.delete(`/pages/${pageId}/share/${userId}`);
  },

  getPageAccess: async (pageId: string) => {
    const response = await api.get(`/pages/${pageId}/access`);
    return response.data.data;
  },
};

export default api;
