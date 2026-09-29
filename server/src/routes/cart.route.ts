import { Router } from "express";
import { reserve } from "../controllers/cart.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/reserve", requireAuth, reserve);

export default router;
