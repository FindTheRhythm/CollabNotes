import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

const log = {
  info: (msg: string, data?: any) => console.log(`[AUTH CONTROLLER] ${msg}`, data || ""),
  error: (msg: string, data?: any) => console.error(`[AUTH CONTROLLER ERROR] ${msg}`, data || ""),
};

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = req.body;
    log.info("Register request received", { email, username });
    
    try {
      const result = await authService.register(email, username, password);
      log.info("Register response sent", { userId: result.user.id });

      res.status(201).json(
        createSuccessResponse(result, "User registered successfully", 201)
      );
    } catch (error) {
      log.error("Register controller error", { email, error: (error as Error).message });
      throw error;
    }
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    log.info("Login request received", { email });
    
    try {
      const result = await authService.login(email, password);
      log.info("Login response sent", { userId: result.user.id });

      res.status(200).json(
        createSuccessResponse(result, "User logged in successfully", 200)
      );
    } catch (error) {
      log.error("Login controller error", { email, error: (error as Error).message });
      throw error;
    }
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    log.info("Logout request received");
    const { refreshToken } = req.body;
    await authService.logout(req.user!.userId, refreshToken);

    res.status(200).json(
      createSuccessResponse(null, "User logged out successfully", 200)
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    log.info("Refresh tokens request received");
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(
      createSuccessResponse(tokens, "Tokens refreshed successfully", 200)
    );
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    log.info("Get current user request received", { userId: req.user?.userId });
    const user = await authService.getCurrentUser(req.user!.userId);

    res.status(200).json(
      createSuccessResponse(user, "User retrieved successfully", 200)
    );
  });
}

export const authController = new AuthController();
