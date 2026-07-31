import mongoose from "mongoose";

const dbConnection = async () => {
    const uri = process.env.MONGODB_URI.replace(
        "<db_password>",
        process.env.MONGODB_PASSWORD,
    );

    const conn = await mongoose.connect(uri);
    console.log(`Database connected: ${conn.connection.host}`);
};

export default dbConnection;
