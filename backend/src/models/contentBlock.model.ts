export type ContentBlockType =
  | "text"
  | "heading"
  | "checklist"
  | "image"
  | "code"
  | "quote"
  | "table"
  | "drawing";

export interface ContentBlockModel {
  id: string;
  page_id: string;
  type: ContentBlockType;
  content: any; // JSONB
  position: number;
  style?: any; // JSONB
  created_at: Date;
  updated_at: Date;
}
