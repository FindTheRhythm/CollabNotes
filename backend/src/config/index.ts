import "dotenv/config";

const requiredEnvVars = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET"
];

// In development, DB and Redis are optional
const isDev = process.env.NODE_ENV === "development";
if (!isDev) {
  requiredEnvVars.push("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD");
}

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export const config = {
  node: {
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000", 10),
    isDev: isDev
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "collabnotes_dev",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres_password",
    ssl: process.env.DB_SSL === "true"
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10)
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",")
  }
} as const;
