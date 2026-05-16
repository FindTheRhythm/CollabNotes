import { Router } from "express";
import { notebookController } from "../controllers/notebook.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/reorder", authMiddleware, notebookController.reorderNotebooks.bind(notebookController));
router.post("/sections/reorder", authMiddleware, notebookController.reorderSections.bind(notebookController));

export default router;
