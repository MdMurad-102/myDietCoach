// context/UserContext.tsx

import { createContext } from "react";

// Updated User type for PostgreSQL (no longer using Convex Id)
export type UserType = {
  id: number; // PostgreSQL uses number ids
  name: string;
  email: string;
  picture?: string;
  subscription_id?: string;
  credit?: number;
  weight?: string;
  height?: string;
  gender?: string;
  goal?: string;
  age?: string;
  calories?: number;
  proteins?: number;
  country?: string;
  city?: string;
  diet_type?: string;
  daily_water_goal?: number;
  created_at?: Date;
  updated_at?: Date;
} | null;

export type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
