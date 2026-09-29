import { AppDataSource } from "../config/database";
import { CartItem } from "../entities/cartitem.entity";
import { Order, OrderStatus } from "../entities/order.entity";
import { Product } from "../entities/product.entity";
import {
    consumeReservation,
    getReservation,
    releaseReservation,
} from "./reservation.service";

export class OrderService {
    private orderRepo = AppDataSource.getRepository(Order);
    private itemRepo = AppDataSource.getRepository(CartItem);

    async checkout(userId: number, idempotencyKey: string, cartItemId: number) {
        if (!idempotencyKey || idempotencyKey.length > 128) {
            throw new Error("A valid Idempotency-Key header is required");
        }

        const existing = await this.orderRepo.findOne({
            where: { idempotencyKey },
        });
        if (existing && existing.userId === userId) {
            return existing;
        }
        if (existing && existing.userId !== userId) {
            throw new Error("Idempotency key already belongs to another user");
        }
        if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
            throw new Error("cartItemId is require");
        }

        const item = await this.itemRepo.findOne({
            where: { id: cartItemId },
            relations: { cart: true, product: true },
        });

        if (!item || item.cart.userId !== userId) {
            throw new Error("Reserved cart item not found");
        }

        if (
            !item.reservationToken ||
            !item.reservationExpiresAt ||
            item.reservationExpiresAt.getTime() <= Date.now()
        ) {
            throw new Error("Reservation expired");
        }

        const reservation = await getReservation(item.reservationToken);
        if (
            !reservation ||
            Number(reservation.userId) !== userId ||
            Number(reservation.productId) !== item.productId ||
            Number(reservation.quantity) !== item.quantity
        ) {
            throw new Error("Reservation is no longer valid");
        }

        const reservationToken = item.reservationToken;
        const qr = AppDataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            const duplicate = await qr.manager.findOne(Order, {
                where: { idempotencyKey },
                lock: { mode: "pessimistic_read" },
            });
            if (duplicate) {
                await qr.rollbackTransaction();
                return duplicate;
            }

            // Authoritative DB guard against overselling.
            const result = await qr.manager
                .createQueryBuilder()
                .update(Product)
                .set({ stock: () => `"stock" - ${item.quantity}` })
                .where("id = :id", { id: item.productId })
                .andWhere("stock >= :quantity", { quantity: item.quantity })
                .execute();

            if (result.affected !== 1) {
                await qr.rollbackTransaction();
                await releaseReservation(item.reservationToken, item.productId);
                throw new Error("Stock is no longer available");
            }

            const total = (Number(item.product.price) * item.quantity).toFixed(
                2
            );
            const order = qr.manager.create(Order, {
                userId: userId!,
                idempotencyKey,
                status: OrderStatus.CONFIRMED,
                totalAmount: total,
                items: [
                    {
                        productId: item.productId,
                        name: item.product.title,
                        quantity: item.quantity,
                        unitPrice: item.product.price,
                    },
                ],
            });

            const saved = await qr.manager.save(order);

            item.reservationToken = null;
            item.reservationExpiresAt = null;
            await qr.manager.save(item);
            await qr.commitTransaction();
            await consumeReservation(reservationToken!);

            return saved;
        } catch (e: any) {
            await qr.rollbackTransaction();

            if (item.reservationToken) {
                await releaseReservation(
                    item.reservationToken,
                    item.productId
                ).catch(() => undefined);
            }

            if (e?.code === "23505") {
                const duplicate = await this.orderRepo.findOne({
                    where: { idempotencyKey },
                });
                if (duplicate) return duplicate;
            }
        } finally {
            await qr.release();
        }
    }
}
