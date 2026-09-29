import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { CartItem } from "./cartitem.entity";

export enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
}

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 255,
    })
    title!: string;

    @Column({
        type: "text",
        nullable: true,
    })
    description?: string;

    @Column({
        type: "numeric",
        precision: 12,
        scale: 2,
    })
    price!: string;

    @Column({ type: "integer", default: 0 })
    stock!: number;

    @Column({ type: "integer", default: 0, name: "initial_stock" })
    initialStock!: number;

    @Column({
        type: "enum",
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    })
    status!: ProductStatus;

    @OneToMany(() => CartItem, (cartItem) => cartItem.product)
    cartItems!: CartItem[];

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
