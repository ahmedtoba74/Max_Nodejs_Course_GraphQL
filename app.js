import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import postRouter from "./src/modules/post/post.router.js";
import authRouter from "./src/modules/auth/auth.router.js";
import userRouter from "./src/modules/user/user.router.js";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/utils/errorHandler.js";

const app = express();

app.use(
    cors({
        origin: (origin, callback) => callback(null, true),
        credentials: true,
    }),
);

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join("images")));

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);

app.get("/", (req, res) => {
    res.send("test");
});

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
