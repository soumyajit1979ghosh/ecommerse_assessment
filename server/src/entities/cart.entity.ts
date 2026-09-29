import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { CartItem } from "./cartitem.entity";

export enum CartStatus {
    ACTIVE = "active",
    CHECKED_OUT = "checked_out",
}

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({ name: "user_id" })
    userId!: number;

    @OneToOne(() => User, (user) => user.cart, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "enum", enum: CartStatus, default: CartStatus.ACTIVE })
    status!: CartStatus;

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

    @OneToMany(() => CartItem, (cartitems) => cartitems.cart, { cascade: true })
    cartItems!: CartItem[];
}
