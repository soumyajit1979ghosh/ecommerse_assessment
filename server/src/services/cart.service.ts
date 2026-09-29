import { AppDataSource } from "../config/database";
import { Product, ProductStatus } from "../entities/product.entity";
import { Cart } from "../entities/cart.entity";
import { CartItem } from "../entities/cartitem.entity";
import { ensureProductStock, reserveStock } from "./reservation.service";

export class CartService {
    private productRepo = AppDataSource.getRepository(Product);
    private cartRepo = AppDataSource.getRepository(Cart);
    private cartItemRepo = AppDataSource.getRepository(CartItem);

    async reserve(userId: number, productId: number, quantity: number) {
        const product = await this.productRepo.findOne({
            where: { id: productId, status: ProductStatus.ACTIVE },
        });

        if (!product) {
            throw new Error("Product not found");
        }
        await ensureProductStock(product.id, product.stock);
        const reservation = await reserveStock(product.id, userId, quantity);

        let cart = await this.cartRepo.findOne({ where: { userId } });
        if (!cart) {
            cart = this.cartRepo.create({ userId });
            await this.cartRepo.save(cart);
        }

        let item = await this.cartItemRepo.findOne({
            where: { cartId: cart.id, productId: product.id },
        });

        try {
            if (item) {
                item.quantity = quantity;
                item.reservationToken = reservation.token;
                item.reservationExpiresAt = reservation.expiresAt;
            } else {
                item = this.cartItemRepo.create({
                    cartId: cart.id,
                    productId: product.id,
                    quantity,
                    reservationToken: reservation.token,
                    reservationExpiresAt: reservation.expiresAt,
                });
            }
            await this.cartItemRepo.save(item);
        } catch (e) {
            const { releaseReservation } =
                await import("../services/reservation.service");
            await releaseReservation(reservation.token, product.id);
            throw e;
        }

        return {
            cartItemId: item.id,
            productId,
            quantity,
            reservationToken: reservation.token,
            expiresAt: reservation.expiresAt.toISOString(),
        };
    }
}
