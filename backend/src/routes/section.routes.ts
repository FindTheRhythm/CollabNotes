import { Router } from "express";
import { sectionController } from "../controllers/section.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authMiddleware, sectionController.getSections);
router.get("/:sectionId", authMiddleware, sectionController.getSection);
router.post("/", authMiddleware, sectionController.createSection);
router.put("/:sectionId", authMiddleware, sectionController.updateSection);
router.delete("/:sectionId", authMiddleware, sectionController.deleteSection);
router.put("/reorder", authMiddleware, sectionController.reorderSections);

export default router;
