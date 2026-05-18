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

  async findAccessibleByUserId(userId: string): Promise<WorkspaceModel[]> {
    const result = await query(
      `SELECT DISTINCT w.* FROM workspaces w
       LEFT JOIN resource_access ra ON ra.resource_type = 'WORKSPACE' AND ra.resource_id = w.id AND ra.user_id = $1
       LEFT JOIN notebooks n ON n.workspace_id = w.id
       LEFT JOIN resource_access rn ON rn.resource_type = 'NOTEBOOK' AND rn.resource_id = n.id AND rn.user_id = $1
       WHERE w.owner_id = $1 OR ra.user_id = $1 OR rn.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );
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
