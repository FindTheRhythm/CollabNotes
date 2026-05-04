import api from "@/api/client.ts";
import { IComment } from "@/types/index.ts";

export const commentAPI = {
  getNoteComments: async (noteId: string): Promise<IComment[]> => {
    const response = await api.get(`/comments/${noteId}`);
    return response.data.data;
  },

  create: async (noteId: string, content: string): Promise<IComment> => {
    const response = await api.post("/comments", { noteId, content });
    return response.data.data;
  },

  update: async (id: string, content: string): Promise<IComment> => {
    const response = await api.put(`/comments/${id}`, { content });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  }
};
