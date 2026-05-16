import { NotebookModel } from "../models/notebook.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class NotebookRepository {
  async findById(id: string): Promise<NotebookModel | null> {
    const result = await query(`SELECT * FROM notebooks WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByWorkspaceId(workspaceId: string): Promise<NotebookModel[]> {
    const result = await query(`SELECT * FROM notebooks WHERE workspace_id = $1 ORDER BY position ASC`, [workspaceId]);
    return result.rows;
  }

  async create(title: string, workspaceId: string, ownerId: string, color?: string | null, icon?: string | null, position = 0): Promise<NotebookModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO notebooks (id, title, workspace_id, owner_id, color, icon, position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *`,
      [id, title, workspaceId, ownerId, color || null, icon || null, position]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<NotebookModel>): Promise<NotebookModel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (updates.title !== undefined) { fields.push(`title = $${param++}`); values.push(updates.title); }
    if (updates.color !== undefined) { fields.push(`color = $${param++}`); values.push(updates.color); }
    if (updates.icon !== undefined) { fields.push(`icon = $${param++}`); values.push(updates.icon); }
    if (updates.position !== undefined) { fields.push(`position = $${param++}`); values.push(updates.position); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(`UPDATE notebooks SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${param} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM notebooks WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
}

export const notebookRepository = new NotebookRepository();
