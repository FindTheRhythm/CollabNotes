import { IRefreshToken } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class RefreshTokenRepository {
  async findByToken(token: string): Promise<IRefreshToken | null> {
    const result = await query(
      `SELECT * FROM refresh_tokens WHERE token = $1`,
      [token]
    );
    return result.rows[0] || null;
  }

  async findByUserId(userId: string): Promise<IRefreshToken[]> {
    const result = await query(
      `SELECT * FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  async create(userId: string, token: string, expiresAt: Date): Promise<IRefreshToken> {
    const id = generateId();
    const result = await query(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, userId, token, expiresAt]
    );
    return result.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM refresh_tokens WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async deleteByToken(token: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM refresh_tokens WHERE token = $1`,
      [token]
    );
    return result.rowCount! > 0;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );
    return result.rowCount! > 0;
  }

  async cleanup(): Promise<void> {
    await query(`DELETE FROM refresh_tokens WHERE expires_at < NOW()`);
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
