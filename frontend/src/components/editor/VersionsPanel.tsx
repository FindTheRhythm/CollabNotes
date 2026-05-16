import React, { useEffect, useState } from "react";
import api from "@/api/client";

export const VersionsPanel: React.FC<{ pageId?: string }> = ({ pageId }) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pageId) return;
    setLoading(true);
    api.get(`/pages/${pageId}/versions`).then(res => {
      setVersions(res.data.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [pageId]);

  const handleRestore = async (versionId: string) => {
    if (!pageId) return;
    try {
      await api.post(`/pages/${pageId}/versions/${versionId}/restore`);
      alert('Version restored');
    } catch (err) {
      alert('Restore failed');
    }
  };

  return (
    <div className="versions-panel">
      <h4>Versions</h4>
      {loading && <div>Loading...</div>}
      <ul>
        {versions.map(v => (
          <li key={v.id}>
            <div>{v.version_number} — {new Date(v.created_at).toLocaleString()}</div>
            <button onClick={() => handleRestore(v.id)}>Restore</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VersionsPanel;
