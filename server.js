import "dotenv/config";
import app from "./app.js";
import dbConnection from "./src/config/database.js";

const port = process.env.PORT || 8000;

try {
    await dbConnection();
    app.listen(port, () => {
        console.log(`==========================================`);
        console.log(`Server is running on port ${port}`);
        console.log(`==========================================`);
    });
} catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
}
