import { UserRole } from "../types/index.js";

export interface UserModel {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
