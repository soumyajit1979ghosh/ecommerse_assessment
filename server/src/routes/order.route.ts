import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { checkout } from "../controllers/order.controller";

const router = Router();

router.post("/checkout", requireAuth, checkout);

export default router;
