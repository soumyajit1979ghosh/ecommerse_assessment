import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { z } from "zod";
import { CartService } from "../services/cart.service";

const cartService = new CartService();

const cartSchema = z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(20),
});

export const reserve = async (req: AuthRequest, res: Response) => {
    try {
        const data = cartSchema.parse(req.body);
        const result = await cartService.reserve(
            req.userId!,
            data.productId,
            data.quantity
        );
        return res.status(200).json(result);
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.issues,
            });
        }

        return res.status(401).json({
            message: error.message,
        });
    }
};
