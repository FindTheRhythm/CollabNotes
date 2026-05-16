import { Router } from "express";
import { contentBlockController } from "../controllers/contentBlock.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/reorder", authMiddleware, contentBlockController.reorderBlocks.bind(contentBlockController));

export default router;
