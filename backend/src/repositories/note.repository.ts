import { INote } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class NoteRepository {
  async findById(id: string): Promise<INote | null> {
    const result = await query(
      `SELECT * FROM notes WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByOwnerId(ownerId: string, offset: number, limit: number): Promise<{ notes: INote[]; total: number }> {
    const [notesResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM notes WHERE owner_id = $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3`,
        [ownerId, offset, limit]
      ),
      query(`SELECT COUNT(*) FROM notes WHERE owner_id = $1`, [ownerId])
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async findAll(offset: number, limit: number): Promise<{ notes: INote[]; total: number }> {
    const [notesResult, countResult] = await Promise.all([
      query(`SELECT * FROM notes ORDER BY created_at DESC OFFSET $1 LIMIT $2`, [offset, limit]),
      query(`SELECT COUNT(*) FROM notes`)
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async findAccessibleByUserId(userId: string, offset: number, limit: number): Promise<{ notes: (INote & { permission?: string })[]; total: number }> {
    const [notesResult, countResult] = await Promise.all([
      query(
        `SELECT DISTINCT n.*, ra.permission AS permission FROM notes n
         LEFT JOIN resource_access ra ON ra.resource_type = 'NOTE' AND ra.resource_id = n.id AND ra.user_id = $1
         WHERE n.owner_id = $1 OR ra.user_id = $1
         ORDER BY n.created_at DESC
         OFFSET $2 LIMIT $3`,
        [userId, offset, limit]
      ),
      query(
        `SELECT COUNT(DISTINCT n.id) FROM notes n
         LEFT JOIN resource_access ra ON ra.resource_type = 'NOTE' AND ra.resource_id = n.id AND ra.user_id = $1
         WHERE n.owner_id = $1 OR ra.user_id = $1`,
        [userId]
      )
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async searchAccessibleByUserId(queryText: string, userId: string, offset: number, limit: number): Promise<{ notes: (INote & { permission?: string })[]; total: number }> {
    const searchQuery = `%${queryText}%`;
    const [notesResult, countResult] = await Promise.all([
      query(
        `SELECT DISTINCT n.*, ra.permission AS permission FROM notes n
         LEFT JOIN resource_access ra ON ra.resource_type = 'NOTE' AND ra.resource_id = n.id AND ra.user_id = $1
         WHERE (n.owner_id = $1 OR ra.user_id = $1)
           AND (n.title ILIKE $2 OR n.content ILIKE $2)
         ORDER BY n.created_at DESC
         OFFSET $3 LIMIT $4`,
        [userId, searchQuery, offset, limit]
      ),
      query(
        `SELECT COUNT(DISTINCT n.id) FROM notes n
         LEFT JOIN resource_access ra ON ra.resource_type = 'NOTE' AND ra.resource_id = n.id AND ra.user_id = $1
         WHERE (n.owner_id = $1 OR ra.user_id = $1)
           AND (n.title ILIKE $2 OR n.content ILIKE $2)`,
        [userId, searchQuery]
      )
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }

  async create(title: string, content: string, ownerId: string): Promise<INote> {
    const id = generateId();
    const result = await query(
      `INSERT INTO notes (id, title, content, owner_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [id, title, content, ownerId]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<INote>): Promise<INote | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }

    if (updates.content !== undefined) {
      fields.push(`content = $${paramCount++}`);
      values.push(updates.content);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE notes SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM notes WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async search(query_text: string, offset: number, limit: number): Promise<{ notes: INote[]; total: number }> {
    const searchQuery = `%${query_text}%`;
    const [notesResult, countResult] = await Promise.all([
      query(
        `SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1 ORDER BY created_at DESC OFFSET $2 LIMIT $3`,
        [searchQuery, offset, limit]
      ),
      query(`SELECT COUNT(*) FROM notes WHERE title ILIKE $1 OR content ILIKE $1`, [searchQuery])
    ]);

    return {
      notes: notesResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }
}

export const noteRepository = new NoteRepository();
