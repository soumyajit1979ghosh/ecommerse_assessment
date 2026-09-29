import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/user.entity";
import { Cart } from "../entities/cart.entity";
import { CartItem } from "../entities/cartitem.entity";
import { Product } from "../entities/product.entity";
import { Order } from "../entities/order.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: `${process.env.DB_HOST}`,
    port: Number(process.env.DB_PORT),
    username: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_NAME}`,
    synchronize: `${process.env.NODE_ENV}` === "development",
    logging: false,
    entities: [User, Product, Cart, CartItem, Order],
});
