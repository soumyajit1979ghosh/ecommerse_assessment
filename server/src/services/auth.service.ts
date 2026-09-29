import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/user.entity";
import { Cart } from "../entities/cart.entity";

export class AuthService {
    private userRepo = AppDataSource.getRepository(User);
    private cartRepo = AppDataSource.getRepository(Cart);

    async register(username: string, email: string, password: string) {
        const existingUser = await this.userRepo.findOne({ where: { email } });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({
            username,
            email,
            password: hashedPassword,
        });
        await this.userRepo.save(user);

        const cart = this.cartRepo.create({ userId: user.id });
        await this.cartRepo.save(cart);

        return {
            user: { id: user.id, username: user.username, email: user.email },
        };
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });

        if (!user) {
            throw new Error("Invalid email or password");
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            {
                sub: String(user.id),
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: process.env
                    .JWT_EXPIRES_IN as SignOptions["expiresIn"],
            }
        );

        return {
            token,
            user: { id: user.id, username: user.username, email: user.email },
        };
    }
}
