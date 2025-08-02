// context/UserContext.tsx

import { Id } from "@/convex/_generated/dataModel";
import { createContext } from "react";

export type UserType = {
  _id: Id<"Users">;
  name: string;
  email: string;
  weight?: string;
  height?: string;
  gender?: string;
  goal?: string;
  age?: string;
  calories?: number;
  proteins?: number;
  country?: string;
  city?: string;
  dietType?: string;
} | null;

export type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
