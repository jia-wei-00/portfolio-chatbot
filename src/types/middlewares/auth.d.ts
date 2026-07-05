export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  aud: string;
  exp: number;
  [key: string]: string;
}
