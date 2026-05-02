import { Router } from "express";
import { protect } from "../../middleware/auth.js";
import { getUserInsights } from "../../controllers/Bcontrollers/insightController.js";

const router = Router();

router.get("/:userId", protect, getUserInsights);

export default router;