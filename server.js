import "dotenv/config";
import app from "./app.js";
import dbConnection from "./src/config/database.js";

process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", err);
    process.exit(1);
});

const port = process.env.PORT || 8000;

let server;

try {
    await dbConnection();
    server = app.listen(port, () => {
        console.log(`==========================================`);
        console.log(
            `Server is running on port ${port} [${process.env.NODE_ENV || "development"}]`,
        );
        console.log(`==========================================`);
    });
} catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
}

process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on("SIGTERM", () => {
    console.log("👋 SIGTERM RECEIVED. Shutting down gracefully...");
    if (server) {
        server.close(() => {
            console.log("💥 Process terminated!");
        });
    }
});
