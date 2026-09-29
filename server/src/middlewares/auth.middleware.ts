import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: number;
}

export function requireAuth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    try {
        const payload = jwt.verify(
            header.slice(7),
            `${process.env.JWT_SECRET}`
        ) as {
            sub: string;
        };
        req.userId = Number(payload.sub);
        return next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}