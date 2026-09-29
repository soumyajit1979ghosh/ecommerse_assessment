import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed",
    CANCELLED = "cancelled",
}

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn()
    id!: string;

    @Index()
    @Column({ name: "user_id" })
    userId!: number;

    @ManyToOne(() => User, (user) => user.orders, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Index()
    @Column({ name: "idempotency_key", length: 128, unique: true })
    idempotencyKey!: string;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.PENDING })
    status!: OrderStatus;

    @Column({ type: "numeric", precision: 12, scale: 2 })
    totalAmount!: string;

    @Column({ type: "jsonb" })
    items!: Array<{
        productId: number;
        name: string;
        quantity: number;
        unitPrice: string;
    }>;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date;
}
