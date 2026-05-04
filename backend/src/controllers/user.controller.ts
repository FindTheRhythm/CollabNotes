import { Request, Response } from "express";
import { userService } from "../services/user.service.js";
import { createSuccessResponse } from "../utils/errors.js";
import { asyncHandler } from "../middlewares/async.middleware.js";
import { getPaginationParams } from "../utils/helpers.js";

export class UserController {
  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page, limit } = getPaginationParams(req.query.page, req.query.limit);
    const result = await userService.getAllUsers(page, limit);

    res.status(200).json(
      createSuccessResponse(result, "Users retrieved successfully", 200)
    );
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json(
      createSuccessResponse(user, "User retrieved successfully", 200)
    );
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json(
      createSuccessResponse(user, "User updated successfully", 200)
    );
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await userService.deleteUser(req.params.id);

    res.status(200).json(
      createSuccessResponse(null, "User deleted successfully", 200)
    );
  });
}

export const userController = new UserController();
