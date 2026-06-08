import { Router } from "express";
import { getDashboardStats, getHQStats, getBranchStats, } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/auth.js";
const router = Router();
router.get("/", getDashboardStats);
router.get("/hq", getHQStats);
router.get("/branch", authenticate, getBranchStats);
export default router;
