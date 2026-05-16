import { pageRepository } from "../repositories/page.repository.js";
import { pageVersionRepository } from "../repositories/page-version.repository.js";

class PageService {
  async savePageVersion(pageId: string, content: string): Promise<any> {
    // determine next version number
    const latest = await pageVersionRepository.findLatestByPageId(pageId);
    const nextVersion = latest ? latest.version_number + 1 : 1;

    const version = await pageVersionRepository.create(pageId, content, nextVersion);
    return version;
  }

  async getLatestContent(pageId: string): Promise<string | null> {
    const latest = await pageVersionRepository.findLatestByPageId(pageId);
    return latest ? latest.content : null;
  }

  async search(queryText: string, offset: number, limit: number): Promise<{ results: any[]; total: number }> {
    const res = await pageVersionRepository.search(queryText, offset, limit);
    return res;
  }

  async getVersions(pageId: string): Promise<any[]> {
    return await pageVersionRepository.getByPageId(pageId, 50, 0);
  }

  async restoreVersion(pageId: string, versionId: string): Promise<any> {
    const versions = await pageVersionRepository.getByPageId(pageId, 100, 0);
    const v = versions.find(vv => vv.id === versionId);
    if (!v) throw new Error('Version not found');
    // create a new version with the same content
    const latest = await pageVersionRepository.findLatestByPageId(pageId);
    const nextVersion = latest ? latest.version_number + 1 : 1;
    return await pageVersionRepository.create(pageId, v.content, nextVersion);
  }
}

export const pageService = new PageService();
