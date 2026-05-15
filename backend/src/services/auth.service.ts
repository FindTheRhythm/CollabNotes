import { userRepository } from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { hashPassword, comparePasswords } from "../utils/password.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { UnauthorizedError, ConflictError, NotFoundError } from "../utils/errors.js";
import { AuthTokensDTO, UserResponseDTO } from "../dto/auth.dto.js";
import { IUser, IAuthPayload } from "../types/models.js";
import { getCurrentTimestamp } from "../utils/helpers.js";

const log = {
  info: (msg: string, data?: any) => console.log(`[AUTH INFO] ${msg}`, data || ""),
  error: (msg: string, data?: any) => console.error(`[AUTH ERROR] ${msg}`, data || ""),
  debug: (msg: string, data?: any) => console.log(`[AUTH DEBUG] ${msg}`, data || ""),
};

export class AuthService {
  async register(email: string, username: string, password: string): Promise<{ user: UserResponseDTO; tokens: AuthTokensDTO }> {
    try {
      log.info("Register attempt", { email, username });

      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        log.info("User already exists", { email });
        throw new ConflictError("User with this email already exists");
      }
      log.debug("Email check passed");

      const existingUsername = await userRepository.findByUsername(username);
      if (existingUsername) {
        log.info("Username already taken", { username });
        throw new ConflictError("Username already taken");
      }
      log.debug("Username check passed");

      log.debug("Hashing password...");
      const passwordHash = await hashPassword(password);
      
      log.debug("Creating user in database...");
      const user = await userRepository.create(email, username, passwordHash);
      log.info("User created successfully", { userId: user.id, email, username });

      log.debug("Generating tokens...");
      const tokens = this.generateTokens(user);
      
      log.debug("Saving refresh token...");
      await refreshTokenRepository.create(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());
      log.info("Refresh token saved");

      log.info("Register successful", { userId: user.id, email });
      return {
        user: this.mapUserToDTO(user),
        tokens
      };
    } catch (error) {
      log.error("Register failed", { email, username, error: (error as Error).message });
      throw error;
    }
  }

  async login(email: string, password: string): Promise<{ user: UserResponseDTO; tokens: AuthTokensDTO }> {
    try {
      log.info("Login attempt", { email });

      const user = await userRepository.findByEmail(email);
      if (!user) {
        log.info("User not found", { email });
        throw new UnauthorizedError("Invalid email or password");
      }
      log.debug("User found", { userId: user.id });

      log.debug("Comparing passwords...");
      const isPasswordValid = await comparePasswords(password, user.password_hash);
      if (!isPasswordValid) {
        log.info("Invalid password", { email });
        throw new UnauthorizedError("Invalid email or password");
      }
      log.debug("Password valid");

      log.debug("Generating tokens...");
      const tokens = this.generateTokens(user);
      
      log.debug("Saving refresh token...");
      await refreshTokenRepository.create(user.id, tokens.refreshToken, this.getRefreshTokenExpiry());
      log.info("Login successful", { userId: user.id, email });

      return {
        user: this.mapUserToDTO(user),
        tokens
      };
    } catch (error) {
      log.error("Login failed", { email, error: (error as Error).message });
      throw error;
    }
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
