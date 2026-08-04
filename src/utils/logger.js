import winston from "winston";
import path from "path";

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: logFormat,
    defaultMeta: { service: "graphql-api" },
    transports: [
        // Write all error-level logs to logs/error.log
        new winston.transports.File({
            filename: path.join("logs", "error.log"),
            level: "error",
        }),
        // Write all logs (info, warn, error) to logs/combined.log
        new winston.transports.File({
            filename: path.join("logs", "combined.log"),
        }),
    ],
});

// Output colored logs to Console in development mode
if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
            ),
        }),
    );
}

export default logger;
