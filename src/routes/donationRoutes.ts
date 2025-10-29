import { Router } from "express";
import { createDonation } from "../controllers/donationController";

const router = Router();

router.post("/donations", createDonation);

export default router;
