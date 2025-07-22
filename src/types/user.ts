// src/types/user.ts

interface JobPreferences {
  preferred_roles: string;
  preferred_location: string;
  salary_range: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  preferences?: JobPreferences;
}
