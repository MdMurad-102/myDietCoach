import { createContext } from "react";
import { Id } from "@/convex/_generated/dataModel";

// Define the user object type
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

// Define the context type
export type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

// Create the context
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);
