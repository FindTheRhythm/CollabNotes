import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);

    res.status(201).json(
      createSuccessResponse(result, "User registered successfully", 201)
    );
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.status(200).json(
      createSuccessResponse(result, "User logged in successfully", 200)
    );
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    await authService.logout(req.user!.userId, refreshToken);

    res.status(200).json(
      createSuccessResponse(null, "User logged out successfully", 200)
    );
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(
      createSuccessResponse(tokens, "Tokens refreshed successfully", 200)
    );
  });

  getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.status(200).json(
      createSuccessResponse(user, "User retrieved successfully", 200)
    );
  });
}

export const authController = new AuthController();
