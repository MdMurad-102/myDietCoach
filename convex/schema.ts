import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  Users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.optional(v.string()),
    subscriptionId: v.optional(v.string()),
    credit: v.optional(v.number()),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    gender: v.optional(v.string()),
    goal: v.optional(v.string()),
    age: v.optional(v.string()),
    calories: v.optional(v.number()),
    proteins: v.optional(v.number()),
    country: v.optional(v.string()), // Add country
    city: v.optional(v.string()), // Add city
    dietType: v.optional(v.string()), // Add dietType
  }),

  Recipes: defineTable({
    jsonData: v.any(),
    userId: v.id("Users"),
    imageUrl: v.optional(v.string()),
    recipeName: v.any(),
  }),

  MealPlans: defineTable({
    userId: v.id("Users"),
    planName: v.string(),
    dateCreated: v.string(),
    dateScheduled: v.string(), // When user wants to follow this plan
    status: v.string(), // "active", "completed", "scheduled"
    mealPlanData: v.any(), // Complete meal plan JSON data
    totalCalories: v.number(),
    totalProtein: v.number(),
    isActive: v.boolean(), // Only one can be active at a time
  }),
});
