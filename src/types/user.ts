// src/types/user.ts

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  preferences?: Record<string, any>; // or define a shape if known
}
