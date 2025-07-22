// src/types/user.ts

export interface UserProfile {
  id: number;
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferences?: Record<string, unknown>;
  created_at?: string;
}
