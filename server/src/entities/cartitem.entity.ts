import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Product } from "./product.entity";
import { Cart } from "./cart.entity";

@Entity("cart_items")
export class CartItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        name: "cart_id",
    })
    cartId!: number;

    @ManyToOne(() => Cart, (carts) => carts.cartItems, { onDelete: "CASCADE" })
    @JoinColumn({ name: "cart_id" })
    cart!: Cart;

    @Column({ name: "product_id" })
    productId!: number;

    @ManyToOne(() => Product, (product) => product.cartItems, {
        onDelete: "RESTRICT",
    })
    @JoinColumn({ name: "product_id" })
    product!: Product;

    @Column({ type: "integer" })
    quantity!: number;

    @Column({ name: "reservation_token", type: "uuid", nullable: true })
    reservationToken!: string | null;

    @Column({
        name: "reservation_expires_at",
        type: "timestamptz",
        nullable: true,
    })
    reservationExpiresAt!: Date | null;

    @CreateDateColumn({
        type: "timestamptz",
        name: "created_at",
    })
    createdAt!: Date;

    @UpdateDateColumn({
        type: "timestamptz",
        name: "updated_at",
    })
    updatedAt!: Date;
}
