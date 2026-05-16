import { Router } from "express";
import { pageController } from "../controllers/page.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/:id/versions', authMiddleware, pageController.saveVersion);
router.get('/:id/versions/latest', authMiddleware, pageController.getLatest);
router.get('/search', authMiddleware, pageController.search);
router.get('/:id/versions', authMiddleware, pageController.listVersions);
router.post('/:id/versions/:versionId/restore', authMiddleware, pageController.restoreVersion);
router.get('/:id/authorize', authMiddleware, pageController.authorizeAccess);
router.post('/reorder', authMiddleware, pageController.movePages);

export default router;
