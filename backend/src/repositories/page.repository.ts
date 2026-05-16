import { PageModel } from "../models/page.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class PageRepository {
  async findById(id: string): Promise<PageModel | null> {
    const result = await query(`SELECT * FROM pages WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findBySectionId(sectionId: string): Promise<PageModel[]> {
    const result = await query(`SELECT * FROM pages WHERE section_id = $1 ORDER BY position ASC`, [sectionId]);
    return result.rows;
  }

  async create(title: string, sectionId: string, position = 0): Promise<PageModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO pages (id, title, section_id, position, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [id, title, sectionId, position]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<PageModel>): Promise<PageModel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (updates.title !== undefined) { fields.push(`title = $${param++}`); values.push(updates.title); }
    if (updates.position !== undefined) { fields.push(`position = $${param++}`); values.push(updates.position); }

    if ((updates as any).section_id !== undefined) { fields.push(`section_id = $${param++}`); values.push((updates as any).section_id); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(`UPDATE pages SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${param} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM pages WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
}

export const pageRepository = new PageRepository();
