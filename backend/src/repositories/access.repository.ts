import { ISharedAccess } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class AccessRepository {
  async findById(id: string): Promise<ISharedAccess | null> {
    const result = await query(
      `SELECT * FROM shared_access WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByNoteAndUser(noteId: string, userId: string): Promise<ISharedAccess | null> {
    const result = await query(
      `SELECT * FROM shared_access WHERE note_id = $1 AND user_id = $2`,
      [noteId, userId]
    );
    return result.rows[0] || null;
  }

  async findByNoteId(noteId: string): Promise<ISharedAccess[]> {
    const result = await query(
      `SELECT * FROM shared_access WHERE note_id = $1`,
      [noteId]
    );
    return result.rows;
  }

  async findByUserId(userId: string): Promise<ISharedAccess[]> {
    const result = await query(
      `SELECT * FROM shared_access WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  async create(noteId: string, userId: string, permission: string): Promise<ISharedAccess> {
    const id = generateId();
    const result = await query(
      `INSERT INTO shared_access (id, note_id, user_id, permission, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [id, noteId, userId, permission]
    );
    return result.rows[0];
  }

  async update(id: string, permission: string): Promise<ISharedAccess | null> {
    const result = await query(
      `UPDATE shared_access SET permission = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [permission, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM shared_access WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async deleteByNoteAndUser(noteId: string, userId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM shared_access WHERE note_id = $1 AND user_id = $2`,
      [noteId, userId]
    );
    return result.rowCount! > 0;
  }
}

export const accessRepository = new AccessRepository();
