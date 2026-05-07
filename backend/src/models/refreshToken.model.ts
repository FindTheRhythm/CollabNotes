export interface RefreshTokenModel {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}
