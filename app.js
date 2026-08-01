import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import AppError from "./src/utils/appError.js";
import globalErrorHandler from "./src/utils/errorHandler.js";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import schema from "./graphql/schema.js";
import resolvers from "./graphql/resolvers.js";

const app = express();

app.use(cors());

app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join("images")));

app.get("/graphql", (req, res) => {
    res.type("html");
    res.end(ruruHTML({ endpoint: "/graphql" }));
});

app.post(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: resolvers,
    }),
);

// Handle undefined routes
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
