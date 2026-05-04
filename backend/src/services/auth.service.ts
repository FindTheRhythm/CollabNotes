import { userRepository } from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { hashPassword, comparePasswords } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors.js";
import { AuthTokensDTO, UserResponseDTO } from "../dto/auth.dto.js";
import { IUser, IAuthPayload } from "../types/models.js";
import { getCurrentTimestamp } from "../utils/helpers.js";

export class AuthService {
  async register(email: string, username: string, password: string): Promise<{ user: UserResponseDTO; tokens: AuthTokensDTO }> {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await hashPassword(password);
    const user = await userRepository.create(email, username, passwordHash);

    const tokens = this.generateTokens(user);
    await refreshTokenRepository.create(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return {
      user: this.mapUserToDTO(user),
      tokens
    };
  }

  async login(email: string, password: string): Promise<{ user: UserResponseDTO; tokens: AuthTokensDTO }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const isPasswordValid = await comparePasswords(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = this.generateTokens(user);
    await refreshTokenRepository.create(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return {
      user: this.mapUserToDTO(user),
      tokens
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthTokensDTO> {
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const tokens = this.generateTokens(user);
    await refreshTokenRepository.deleteByToken(refreshToken);
    await refreshTokenRepository.create(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());

    return tokens;
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await refreshTokenRepository.deleteByToken(refreshToken);
  }

  async getCurrentUser(userId: string): Promise<UserResponseDTO> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.mapUserToDTO(user);
  }

  private generateTokens(user: IUser): AuthTokensDTO {
    const payload: IAuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900 // 15 minutes in seconds
    };
  }

  private getRefreshTokenExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    return expiryDate;
  }

  private mapUserToDTO(user: IUser): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  }
}

export const authService = new AuthService();
