import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import feedRouter from "./src/modules/feed/feed.router.js";
import AppError from "./src/utils/appError.js";

const app = express();

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/feed", feedRouter);

app.get("/", (req, res) => {
    res.send("test");
});

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";

    res.status(statusCode).json({
        status: status,
        message: err.message,
    });
};

app.use(globalErrorHandler);

const port = process.env.PORT || 8000;

app.listen(port, () =>
    console.log("Server is running on port", port, "in development mode"),
);
