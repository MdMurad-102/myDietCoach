import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const CreateRecipe = mutation({
  args: {
    jsonData: v.any(),
    uid: v.id("Users"),
    recipeName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.insert("Recipes", {
      jsonData: args.jsonData,
      userId: args.uid,
      recipeName: args.recipeName,
      imageUrl: args.imageUrl,
    });
    return user;
  },
});

export const CreateMealPlan = mutation({
  args: {
    userId: v.id("Users"),
    planName: v.string(),
    mealPlanData: v.any(),
    totalCalories: v.number(),
    totalProtein: v.number(),
  },
  handler: async (ctx, args) => {
    // First, deactivate any existing active meal plans
    const existingPlans = await ctx.db
      .query("MealPlans")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Deactivate existing active plans
    for (const plan of existingPlans) {
      await ctx.db.patch(plan._id, { isActive: false });
    }

    // Create new meal plan
    const newPlan = await ctx.db.insert("MealPlans", {
      userId: args.userId,
      planName: args.planName,
      dateCreated: new Date().toISOString(),
      dateScheduled: new Date().toISOString(),
      status: "active",
      mealPlanData: args.mealPlanData,
      totalCalories: args.totalCalories,
      totalProtein: args.totalProtein,
      isActive: true,
    });

    return newPlan;
  },
});

export const GetUserMealPlans = query({
  args: {
    userId: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const mealPlans = await ctx.db
      .query("MealPlans")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    return mealPlans;
  },
});

export const GetActiveMealPlan = query({
  args: {
    userId: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const activePlan = await ctx.db
      .query("MealPlans")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    return activePlan;
  },
});
