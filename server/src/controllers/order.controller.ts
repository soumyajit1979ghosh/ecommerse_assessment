import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { z } from "zod";
import { OrderService } from "../services/order.service";

const orderService = new OrderService();

export const checkout = async (req: AuthRequest, res: Response) => {
    try {
        const data = req.body;
        const idempotencyKey = String(req.header("Idempotency-Key"));
        const result = await orderService.checkout(
            Number(req.userId),
            idempotencyKey,
            data?.cartItemId
        );
        return res.status(200).json(result);
    } catch (error: any) {
        return res.status(409).json({
            message: error.message,
        });
    }
};
