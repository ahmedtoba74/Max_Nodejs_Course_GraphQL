import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import compression from "compression";
import cookieParser from "cookie-parser";
import toobusy from "toobusy-js";

import sanitizer from "perfect-express-sanitizer";
import depthLimit from "graphql-depth-limit";

import AppError from "./src/utils/appError.js";
import {
    globalErrorHandler,
    formatGraphQLError,
} from "./src/utils/errorHandler.js";
import { createHandler } from "graphql-http/lib/use/express";
import { ruruHTML } from "ruru/server";
import { schema, resolvers } from "./graphql/index.js";

import authGuard from "./src/middlewares/auth.middleware.js";
import { uploadSingle } from "./src/middlewares/multer.middleware.js";
import clearImage from "./src/utils/clearImage.js";

// Validate essential environment variables at startup
const requiredEnvVars = ["PORT", "JWT_SECRET", "MONGODB_URI"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error("################################################");
    console.error("💥 FATAL ERROR: Missing Environment Variables:");
    missingEnvVars.forEach((key) => console.error(`   - ${key}`));
    console.error("################################################");
    process.exit(1);
}

const app = express();

// Overload Protection (Bypassed during automated test execution)
app.use((req, res, next) => {
    if (process.env.NODE_ENV !== "test" && toobusy()) {
        return res
            .status(503)
            .json({ message: "Server busy, try again later." });
    }
    next();
});
// Security Headers & Cookies
app.use(helmet());
app.use(cookieParser());
app.use(
    hpp({
        whitelist: ["page", "sort", "limit", "fields"],
    }),
);
app.use(compression());
// Rate Limiter (Higher limit for development and testing)
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max:
        process.env.NODE_ENV === "development" ||
        process.env.NODE_ENV === "test"
            ? 2000
            : 100,
    message: "Too many requests, please try again later.",
});
app.use("/graphql", limiter);

// Disable X-Powered-By header to prevent server fingerprinting
app.disable("x-powered-by");

app.use(cors());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Data Sanitization against NoSQL injection & XSS
app.use(
    sanitizer.clean({
        xss: true,
        noSql: true,
        sql: false,
    }),
);

// Body parsing with payload size limits (DoS protection)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/images", express.static(path.join("images")));

// Authentication Guard Middleware
app.use(authGuard);

// Image Upload Endpoint (REST binary upload)
app.put("/post-image", uploadSingle("image"), (req, res, next) => {
    if (!req.isAuth) {
        throw new AppError("Not authenticated!", 401);
    }
    if (!req.file) {
        return res.status(200).json({ message: "No file provided!" });
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    const filePath = req.file.path.replace(/\\/g, "/");
    return res
        .status(201)
        .json({ message: "File stored.", filePath: filePath });
});

// GraphQL Playground UI (Only accessible in development mode)
if (process.env.NODE_ENV === "development") {
    app.get("/graphql", (req, res) => {
        res.type("html");
        res.end(ruruHTML({ endpoint: "/graphql" }));
    });
} else {
    app.get("/graphql", (req, res, next) => {
        next(
            new AppError("GraphQL Playground is disabled in production.", 403),
        );
    });
}

// GraphQL HTTP Endpoint with Query Depth Limiting (Max depth 5)
app.post(
    "/graphql",
    createHandler({
        schema: schema,
        rootValue: resolvers,
        validationRules: [depthLimit(5)],
        context: (req) => ({
            req: req.raw,
            res: req.context.res,
        }),
        formatError: formatGraphQLError,
    }),
);

// Handle undefined routes (Generic message prevents URL structure probing)
app.use((req, res, next) => {
    next(new AppError("Resource not found.", 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

export default app;
