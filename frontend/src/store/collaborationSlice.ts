import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface OnlineUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  lastActive: string;
}

export interface Comment {
  id: string;
  pageId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  blockId?: string;
  replies: Array<{
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
  }>;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cursor {
  userId: string;
  userName: string;
  position: number;
  color: string;
}

export interface CollaborationState {
  onlineUsers: OnlineUser[];
  comments: Comment[];
  cursors: Cursor[];
  loadingComments: boolean;
  errorComments: string | null;
}

const initialState: CollaborationState = {
  onlineUsers: [],
  comments: [],
  cursors: [],
  loadingComments: false,
  errorComments: null,
};

const collaborationSlice = createSlice({
  name: "collaboration",
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<OnlineUser[]>) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action: PayloadAction<OnlineUser>) => {
      const exists = state.onlineUsers.find(
        (u) => u.id === action.payload.id
      );
      if (!exists) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(
        (u) => u.id !== action.payload
      );
    },
    updateOnlineUser: (state, action: PayloadAction<OnlineUser>) => {
      const index = state.onlineUsers.findIndex(
        (u) => u.id === action.payload.id
      );
      if (index !== -1) {
        state.onlineUsers[index] = action.payload;
      }
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      state.comments.push(action.payload);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.comments.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    },
    deleteComment: (state, action: PayloadAction<string>) => {
      state.comments = state.comments.filter((c) => c.id !== action.payload);
    },
    addReply: (
      state,
      action: PayloadAction<{
        commentId: string;
        reply: {
          id: string;
          userId: string;
          userName: string;
          userAvatar?: string;
          content: string;
          createdAt: string;
        };
      }>
    ) => {
      const comment = state.comments.find((c) => c.id === action.payload.commentId);
      if (comment) {
        comment.replies.push(action.payload.reply);
      }
    },
    updateCursors: (state, action: PayloadAction<Cursor[]>) => {
      state.cursors = action.payload;
    },
    setLoadingComments: (state, action: PayloadAction<boolean>) => {
      state.loadingComments = action.payload;
    },
    setErrorComments: (state, action: PayloadAction<string | null>) => {
      state.errorComments = action.payload;
    },
  },
});

export const {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  updateOnlineUser,
  setComments,
  addComment,
  updateComment,
  deleteComment,
  addReply,
  updateCursors,
  setLoadingComments,
  setErrorComments,
} = collaborationSlice.actions;

export default collaborationSlice.reducer;
