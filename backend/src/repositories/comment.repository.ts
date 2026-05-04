import { IComment } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class CommentRepository {
  async findById(id: string): Promise<IComment | null> {
    const result = await query(
      `SELECT * FROM comments WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByNoteId(noteId: string): Promise<IComment[]> {
    const result = await query(
      `SELECT * FROM comments WHERE note_id = $1 ORDER BY created_at DESC`,
      [noteId]
    );
    return result.rows;
  }

  async create(noteId: string, userId: string, content: string): Promise<IComment> {
    const id = generateId();
    const result = await query(
      `INSERT INTO comments (id, note_id, user_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [id, noteId, userId, content]
    );
    return result.rows[0];
  }

  async update(id: string, content: string): Promise<IComment | null> {
    const result = await query(
      `UPDATE comments SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [content, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM comments WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }
}

export const commentRepository = new CommentRepository();
