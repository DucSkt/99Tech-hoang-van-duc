import mongoose from "mongoose";
import { ENV } from "./env";

const connectDB = async () => {
    try {
        await mongoose.connect(ENV.MONGO_URI);
        console.info("✅ MongoDB connected successfully!");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
