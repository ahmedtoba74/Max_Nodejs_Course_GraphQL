import mongoose from "mongoose";
import "dotenv/config";
import dbConnection from "../src/config/database.js";

// 1. Runs ONCE before any test starts
before(async function () {
    this.timeout(15000); // Allow time for DB connection
    process.env.NODE_ENV = "test";
    await dbConnection();
    console.log("🧪 Test Database Connected!");
});

// 2. Runs after EACH test case to keep data clean & isolated
afterEach(async function () {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

// 3. Runs ONCE after all tests complete
after(async function () {
    await mongoose.connection.close();
    console.log("🧪 Test Database Disconnected!");
});
