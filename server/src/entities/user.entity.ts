import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import { Cart } from "./cart.entity";
import { Order } from "./order.entity";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Index()
    @Column({
        type: "varchar",
        length: 100,
        unique: true,
    })
    username!: string;

    @Index()
    @Column({
        type: "varchar",
        length: 255,
        unique: true,
    })
    email!: string;

    @Column({
        type: "varchar",
        length: 255,
    })
    password!: string;

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

    @OneToOne(() => Cart, (cart) => cart.user)
    cart?: Cart;

    @OneToMany(() => Order, (order) => order.user)
    orders!: Order[];
}
