import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

import app from "./app";
import { AppDataSource } from "./config/database";
import { connectRedis } from "./config/redis";

const port = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        console.log(`✅ PostgreSQL Database connected successfully!`);
        await connectRedis();
        app.listen(port, () => {
            console.log(
                `✅ Server is running on port: http://localhost:${port}`
            );
        });
    } catch (error) {
        console.error("❌ Server failed to run.");
        console.error(error);
        process.exit(1);
    }
};

startServer();
