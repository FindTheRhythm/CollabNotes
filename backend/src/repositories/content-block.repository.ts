import { ContentBlockModel } from "../models/contentBlock.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class ContentBlockRepository {
  async findById(id: string): Promise<ContentBlockModel | null> {
    const result = await query(`SELECT * FROM content_blocks WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByPageId(pageId: string): Promise<ContentBlockModel[]> {
    const result = await query(`SELECT * FROM content_blocks WHERE page_id = $1 ORDER BY position ASC`, [pageId]);
    return result.rows;
  }

  async create(pageId: string, type: string, content: any, position = 0, style: any = null): Promise<ContentBlockModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO content_blocks (id, page_id, type, content, position, style, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [id, pageId, type, content ? JSON.stringify(content) : null, position, style ? JSON.stringify(style) : null]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<ContentBlockModel>): Promise<ContentBlockModel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (updates.type !== undefined) { fields.push(`type = $${param++}`); values.push(updates.type); }
    if (updates.content !== undefined) { fields.push(`content = $${param++}`); values.push(JSON.stringify(updates.content)); }
    if (updates.position !== undefined) { fields.push(`position = $${param++}`); values.push(updates.position); }
    if (updates.style !== undefined) { fields.push(`style = $${param++}`); values.push(JSON.stringify(updates.style)); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(`UPDATE content_blocks SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${param} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM content_blocks WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
}

export const contentBlockRepository = new ContentBlockRepository();
