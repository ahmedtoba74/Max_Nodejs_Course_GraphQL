import "dotenv/config";
import app from "./app.js";
import { createServer } from "node:http";
import dbConnection from "./src/config/database.js";
import { initSocket } from "./src/config/socket.js";

const port = process.env.PORT || 8000;
const httpServer = createServer(app);

const io = initSocket(httpServer);

io.on("connection", (socket) => {
    console.log(`a user connected ${socket.id}`);

    socket.on("disconnect", (reason) => {
        console.log(`user disconnected ${socket.id} due to ${reason}`);
    });
});

try {
    await dbConnection();
    httpServer.listen(port, () => {
        console.log(`==========================================`);
        console.log(`Server is running on port ${port}`);
        console.log(`==========================================`);
    });
} catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
}
