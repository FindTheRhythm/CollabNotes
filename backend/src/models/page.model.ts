export interface PageModel {
  id: string;
  title: string;
  section_id: string;
  position: number;
  created_at: Date;
  updated_at: Date;
  content?: string;
}
