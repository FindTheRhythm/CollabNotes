import { IUser } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";
import { UserRole } from "../types/index.js";

export class UserRepository {
  async findById(id: string): Promise<IUser | null> {
    const result = await query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const result = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findByUsername(username: string): Promise<IUser | null> {
    const result = await query(
      `SELECT * FROM users WHERE username = $1`,
      [username]
    );
    return result.rows[0] || null;
  }

  async findAll(offset: number, limit: number): Promise<{ users: IUser[]; total: number }> {
    const [usersResult, countResult] = await Promise.all([
      query(`SELECT * FROM users OFFSET $1 LIMIT $2`, [offset, limit]),
      query(`SELECT COUNT(*) FROM users`)
    ]);

    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async searchByEmailOrUsername(queryText: string, limit: number): Promise<IUser[]> {
    if (!queryText.trim()) {
      const result = await query(
        `SELECT * FROM users ORDER BY created_at DESC LIMIT $1`,
        [limit]
      );
      return result.rows;
    }

    const search = `%${queryText.trim().toLowerCase()}%`;
    const result = await query(
      `SELECT * FROM users WHERE lower(email) LIKE $1 OR lower(username) LIKE $1 ORDER BY created_at DESC LIMIT $2`,
      [search, limit]
    );
    return result.rows;
  }

  async create(email: string, username: string, passwordHash: string): Promise<IUser> {
    const id = generateId();
    const result = await query(
      `INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, email, username, passwordHash, UserRole.USER]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(updates.username);
    }

    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    if (updates.role !== undefined) {
      fields.push(`role = $${paramCount++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM users WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async updateRole(id: string, role: UserRole): Promise<IUser | null> {
    const result = await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [role, id]
    );
    return result.rows[0] || null;
  }
}

export const userRepository = new UserRepository();
