import { IResourceAccess } from "../types/models.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";
import { AccessResourceType } from "../types/index.js";

export class AccessRepository {
  async findById(id: string): Promise<IResourceAccess | null> {
    const result = await query(
      `SELECT * FROM resource_access WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByResourceAndUser(resourceType: AccessResourceType, resourceId: string, userId: string): Promise<IResourceAccess | null> {
    const result = await query(
      `SELECT * FROM resource_access WHERE resource_type = $1 AND resource_id = $2 AND user_id = $3`,
      [resourceType, resourceId, userId]
    );
    return result.rows[0] || null;
  }

  async findByResource(resourceType: AccessResourceType, resourceId: string): Promise<IResourceAccess[]> {
    const result = await query(
      `SELECT * FROM resource_access WHERE resource_type = $1 AND resource_id = $2`,
      [resourceType, resourceId]
    );
    return result.rows;
  }

  async findByUserId(userId: string): Promise<IResourceAccess[]> {
    const result = await query(
      `SELECT * FROM resource_access WHERE user_id = $1`,
      [userId]
    );
    return result.rows;
  }

  async create(resourceType: AccessResourceType, resourceId: string, userId: string, permission: string): Promise<IResourceAccess> {
    const id = generateId();
    const result = await query(
      `INSERT INTO resource_access (id, resource_type, resource_id, user_id, permission, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [id, resourceType, resourceId, userId, permission]
    );
    return result.rows[0];
  }

  async update(id: string, permission: string): Promise<IResourceAccess | null> {
    const result = await query(
      `UPDATE resource_access SET permission = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [permission, id]
    );
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM resource_access WHERE id = $1`,
      [id]
    );
    return result.rowCount! > 0;
  }

  async deleteByResourceAndUser(resourceType: AccessResourceType, resourceId: string, userId: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM resource_access WHERE resource_type = $1 AND resource_id = $2 AND user_id = $3`,
      [resourceType, resourceId, userId]
    );
    return result.rowCount! > 0;
  }
}

export const accessRepository = new AccessRepository();
