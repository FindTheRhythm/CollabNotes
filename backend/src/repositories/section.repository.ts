import { SectionModel } from "../models/section.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class SectionRepository {
  async findById(id: string): Promise<SectionModel | null> {
    const result = await query(`SELECT * FROM sections WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByNotebookId(notebookId: string): Promise<SectionModel[]> {
    const result = await query(`SELECT * FROM sections WHERE notebook_id = $1 ORDER BY position ASC`, [notebookId]);
    return result.rows;
  }

  async create(title: string, notebookId: string, position = 0): Promise<SectionModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO sections (id, title, notebook_id, position, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [id, title, notebookId, position]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<SectionModel>): Promise<SectionModel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (updates.title !== undefined) { fields.push(`title = $${param++}`); values.push(updates.title); }
    if (updates.position !== undefined) { fields.push(`position = $${param++}`); values.push(updates.position); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(`UPDATE sections SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${param} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM sections WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
}

export const sectionRepository = new SectionRepository();
