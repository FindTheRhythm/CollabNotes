import { comparePasswords, hashPassword, validatePasswordStrength } from "../../src/utils/password.js";

describe("password utilities", () => {
  it("hashes and verifies a password successfully", async () => {
    const password = "StrongP@ssw0rd";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(await comparePasswords(password, hash)).toBe(true);
    expect(await comparePasswords("wrong-password", hash)).toBe(false);
  });

  it("validates password strength rules", () => {
    const errors = validatePasswordStrength("weak");

    expect(errors).toContain("Password must be at least 8 characters");
    expect(errors).toContain("Password must contain at least one uppercase letter");
    expect(errors).toContain("Password must contain at least one number");
    expect(errors).toContain("Password must contain at least one special character");
  });
});
