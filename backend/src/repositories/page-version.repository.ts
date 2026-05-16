import { PageVersionModel } from "../models/pageVersion.model.js";
import { query } from "../config/database.js";
import { generateId } from "../utils/helpers.js";

export class PageVersionRepository {
  async create(pageId: string, content: string, versionNumber: number): Promise<PageVersionModel> {
    const id = generateId();
    const result = await query(
      `INSERT INTO page_versions (id, page_id, content, version_number, created_at)
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [id, pageId, content, versionNumber]
    );
    return result.rows[0];
  }

  async findLatestByPageId(pageId: string): Promise<PageVersionModel | null> {
    const result = await query(
      `SELECT * FROM page_versions WHERE page_id = $1 ORDER BY version_number DESC LIMIT 1`,
      [pageId]
    );
    return result.rows[0] || null;
  }

  async getByPageId(pageId: string, limit = 20, offset = 0): Promise<PageVersionModel[]> {
    const result = await query(
      `SELECT * FROM page_versions WHERE page_id = $1 ORDER BY version_number DESC OFFSET $2 LIMIT $3`,
      [pageId, offset, limit]
    );
    return result.rows;
  }

  async search(queryText: string, offset = 0, limit = 20): Promise<{ results: PageVersionModel[]; total: number }> {
    const q = queryText;
    const [rowsResult, countResult] = await Promise.all([
      query(
        `SELECT pv.* FROM page_versions pv WHERE to_tsvector('russian', coalesce(pv.content,'')) @@ plainto_tsquery('russian', $1) ORDER BY pv.created_at DESC OFFSET $2 LIMIT $3`,
        [q, offset, limit]
      ),
      query(
        `SELECT COUNT(*) FROM page_versions pv WHERE to_tsvector('russian', coalesce(pv.content,'')) @@ plainto_tsquery('russian', $1)`,
        [q]
      )
    ]);

    return {
      results: rowsResult.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  }
}

export const pageVersionRepository = new PageVersionRepository();
