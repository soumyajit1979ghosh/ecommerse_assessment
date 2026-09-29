import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route";
import cartRoute from "./routes/cart.route";
import orderRoute from "./routes/order.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use("/auth", authRoute);
app.use("/cart", cartRoute);
app.use("/order", orderRoute);

app.use(
    (
        err: any,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
    ) => {
        console.error(err);
        if (err?.name === "ZodError")
            return res
                .status(400)
                .json({ error: "Invalid request", details: err.issues });
        return res.status(500).json({ error: "Internal server error" });
    }
);

app.get("/", (req, res) => {
    res.send("<h2>Server is running...</h2>");
});

export default app;
