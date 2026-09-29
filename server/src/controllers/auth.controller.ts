import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";

const authService = new AuthService();

const authRegisterSchema = z.object({
    username: z.string().min(3).max(120),
    email: z.email(),
    password: z.string().min(6),
});

const authLoginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export const register = async (req: Request, res: Response) => {
    try {
        const data = authRegisterSchema.parse(req.body);
        const user = await authService.register(
            data.username,
            data.email,
            data.password
        );
        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return res.status(400).json({
                message: "Invalid input",
                errors: error.issues,
            });
        }

        return res.status(400).json({
            message: error.message,
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const data = authLoginSchema.parse(req.body);
        const result = await authService.login(data.email, data.password);
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
