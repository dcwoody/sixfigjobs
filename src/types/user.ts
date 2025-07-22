// src/types/user.ts

export interface UserProfile {
  id: number;
  auth_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferences?: any; // Optional: replace `any` with a more specific type if you know the shape
  created_at?: string;
}
