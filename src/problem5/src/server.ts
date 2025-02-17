import app from "./app";
import connectDB from "./config/database";
import { ENV } from "./config/env";

const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(ENV.PORT, () => {
            console.info(`🚀 Server running at http://localhost:${ENV.PORT}`);
        });

        process.on("SIGINT", async () => {
            console.info("⏳ Shutting down server...");
            server.close();
            process.exit(0);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

startServer().then(r => {});
