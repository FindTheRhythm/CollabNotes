import { UserRole } from "../types/index.js";

export class RegisterDTO {
  email!: string;
  username!: string;
  password!: string;
}

export class LoginDTO {
  email!: string;
  password!: string;
}

export class UpdateUserDTO {
  username?: string;
  email?: string;
  role?: UserRole;
}

export class AuthTokensDTO {
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: number;
}

export class UserResponseDTO {
  id!: string;
  email!: string;
  username!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}
