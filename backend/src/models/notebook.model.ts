export interface NotebookModel {
  id: string;
  title: string;
  workspace_id: string;
  owner_id: string;
  color?: string | null;
  icon?: string | null;
  position: number;
  created_at: Date;
  updated_at: Date;
}
