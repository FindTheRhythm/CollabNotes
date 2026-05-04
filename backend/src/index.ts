import { pool } from "./config/database.js";
import { redis } from "./config/redis.js";
import app from "./app.js";
import { config } from "./config/index.js";

const PORT = config.node.port;

async function startServer(): Promise<void> {
  try {
    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("✓ Database connected");

    // Test Redis connection
    await redis.ping();
    console.log("✓ Redis connected");

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${config.node.env}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  try {
    await pool.end();
    await redis.quit();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
