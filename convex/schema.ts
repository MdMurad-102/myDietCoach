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
    dailyWaterGoal: v.optional(v.number()), // Daily water goal in ml
  }),

  Recipes: defineTable({
    jsonData: v.any(),
    userId: v.id("Users"),
    imageUrl: v.optional(v.string()),
    recipeName: v.any(),
    isCustom: v.optional(v.boolean()), // Custom recipe flag
    favoriteDate: v.optional(v.string()), // YYYY-MM-DD format for favorite date
    createdAt: v.optional(v.string()),
    tags: v.optional(v.array(v.string())), // Recipe tags
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
    planType: v.optional(v.string()), // "daily", "custom"
  }),

  ScheduledMeals: defineTable({
    userId: v.id("Users"),
    mealPlanId: v.optional(v.id("MealPlans")), // Optional for individual recipes
    recipeId: v.optional(v.id("Recipes")), // For AI-generated recipes
    customRecipeId: v.optional(v.id("CustomRecipes")), // For custom recipes
    scheduledDate: v.string(), // YYYY-MM-DD format
    mealType: v.string(), // breakfast, lunch, dinner, snack
    mealPlanData: v.optional(v.any()), // Copy of meal plan data for quick access
    totalCalories: v.number(),
    totalProtein: v.number(),
    mealsConsumed: v.array(v.string()), // Array of consumed meal types
    caloriesConsumed: v.number(),
    proteinConsumed: v.number(),
    isCompleted: v.optional(v.boolean()),
    dateCreated: v.optional(v.string()),
    lastUpdated: v.optional(v.string()),
  }),

  WaterTracking: defineTable({
    userId: v.id("Users"),
    date: v.string(), // YYYY-MM-DD format
    waterConsumed: v.number(), // in ml
    lastUpdated: v.string(), // timestamp
    glasses: v.array(v.object({
      time: v.string(), // timestamp
      amount: v.number(), // ml
    })),
  }),

  CustomRecipes: defineTable({
    userId: v.id("Users"),
    recipeName: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    calories: v.number(),
    protein: v.number(),
    cookingTime: v.string(),
    servings: v.number(),
    mealType: v.string(), // breakfast, lunch, dinner, snack
    favoriteDate: v.optional(v.string()), // YYYY-MM-DD format
    createdAt: v.string(),
    isActive: v.boolean(),
    tags: v.optional(v.array(v.string())),
  }),
});
