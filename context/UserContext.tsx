// context/UserContext.tsx

import { createContext } from "react";
import { Id } from "@/convex/_generated/dataModel";

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
} | null;

export type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
