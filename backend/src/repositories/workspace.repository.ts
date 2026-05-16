import { WorkspaceModel } from "../models/workspace.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class WorkspaceRepository {
  async findById(id: string): Promise<WorkspaceModel | null> {
    const result = await query(`SELECT * FROM workspaces WHERE id = $1`, [id]);
    return result.rows[0] || null;
  }

  async findByOwnerId(ownerId: string): Promise<WorkspaceModel[]> {
    const result = await query(`SELECT * FROM workspaces WHERE owner_id = $1 ORDER BY created_at DESC`, [ownerId]);
    return result.rows;
  }

  async create(name: string, ownerId: string): Promise<WorkspaceModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO workspaces (id, name, owner_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *`,
      [id, name, ownerId]
    );
    return result.rows[0];
  }

  async update(id: string, updates: Partial<WorkspaceModel>): Promise<WorkspaceModel | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let param = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${param++}`);
      values.push(updates.name);
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const result = await query(`UPDATE workspaces SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${param} RETURNING *`, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM workspaces WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
}

export const workspaceRepository = new WorkspaceRepository();
