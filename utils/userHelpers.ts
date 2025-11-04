// utils/userHelpers.ts

import { UserType } from "@/context/UserContext";

/**
 * Checks if a user's profile is complete and ready for using the app
 * @param user - The user object from UserContext
 * @returns boolean indicating if profile is complete
 */
export const isUserProfileComplete = (user: UserType): boolean => {
  if (!user) return false;

  return !!(
    user.height &&
    user.weight &&
    user.calories &&
    user.proteins &&
    user.gender &&
    user.goal &&
    user.age
  );
};

/**
 * Checks if a user has basic account info (for navigation decisions)
 * @param user - The user object from UserContext
 * @returns boolean indicating if basic info exists
 */
export const hasBasicUserInfo = (user: UserType): boolean => {
  if (!user) return false;

  return !!(user.id && user.name && user.email);
};
