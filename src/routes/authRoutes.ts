import { Router } from "express";
import { startAuth, handleAuthCallback } from "../controllers/authController";

const router = Router();

router.get("/start", startAuth);
router.get("/callback", handleAuthCallback);

export default router;
