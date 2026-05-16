import { Router } from "express";
import { notebookController } from "../controllers/notebook.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, notebookController.getNotebooks.bind(notebookController));
router.get("/:notebookId", authMiddleware, notebookController.getNotebook.bind(notebookController));
router.post("/", authMiddleware, notebookController.createNotebook.bind(notebookController));
router.put("/:notebookId", authMiddleware, notebookController.updateNotebook.bind(notebookController));
router.delete("/:notebookId", authMiddleware, notebookController.deleteNotebook.bind(notebookController));
router.post("/reorder", authMiddleware, notebookController.reorderNotebooks.bind(notebookController));
router.post("/sections/reorder", authMiddleware, notebookController.reorderSections.bind(notebookController));

export default router;
