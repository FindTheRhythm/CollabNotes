import { jest } from "@jest/globals";
import { UserRole } from "../../src/types/index.ts";

beforeAll(() => {
  process.env.JWT_ACCESS_SECRET = "test_access_secret_123456789012345678";
  process.env.JWT_REFRESH_SECRET = "test_refresh_secret_123456789012345678";
  process.env.JWT_ACCESS_EXPIRES_IN = "1h";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.DB_HOST = "localhost";
  process.env.DB_PORT = "5432";
  process.env.DB_NAME = "test_db";
  process.env.DB_USER = "test_user";
  process.env.DB_PASSWORD = "test_password";
});

describe("JWT utilities", () => {
  let jwtUtils: typeof import("../../src/utils/jwt.js");

  beforeAll(async () => {
    jest.resetModules();
    jwtUtils = await import("../../src/utils/jwt.js");
  });

  it("generates and verifies access tokens", () => {
    const payload = { userId: "test-id", email: "test@example.com", role: UserRole.USER } as const;
    const token = jwtUtils.generateAccessToken(payload);

    expect(token).toBeDefined();
    const decoded = jwtUtils.verifyAccessToken(token);

    expect(decoded).toMatchObject(payload);
  });

  it("generates and verifies refresh tokens", () => {
    const payload = { userId: "test-id", email: "test@example.com", role: UserRole.USER } as const;
    const token = jwtUtils.generateRefreshToken(payload);

    expect(token).toBeDefined();
    const decoded = jwtUtils.verifyRefreshToken(token);

    expect(decoded).toMatchObject(payload);
  });
});
