import { Router } from "express";
import { workspaceController } from "../controllers/workspace.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, workspaceController.getWorkspaces);
router.post("/", authMiddleware, workspaceController.createWorkspace);
router.get("/:workspaceId", authMiddleware, workspaceController.getWorkspace);
router.put("/:workspaceId", authMiddleware, workspaceController.updateWorkspace);
router.delete("/:workspaceId", authMiddleware, workspaceController.deleteWorkspace);

export default router;
