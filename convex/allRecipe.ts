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

export const GetUserRecipes = query({
  args: {
    userId: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("Recipes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    return recipes;
  },
});

export const ScheduleMealPlan = mutation({
  args: {
    mealPlanId: v.id("MealPlans"),
    scheduledDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if there's already a scheduled plan for this date
    const existingScheduled = await ctx.db
      .query("ScheduledMeals")
      .filter((q) => q.eq(q.field("scheduledDate"), args.scheduledDate))
      .filter((q) => q.eq(q.field("mealPlanId"), args.mealPlanId))
      .first();

    if (existingScheduled) {
      return existingScheduled;
    }

    // Get the meal plan data
    const mealPlan = await ctx.db.get(args.mealPlanId);
    if (!mealPlan) {
      throw new Error("Meal plan not found");
    }

    // Create scheduled meal entry
    const scheduledMeal = await ctx.db.insert("ScheduledMeals", {
      userId: mealPlan.userId,
      mealPlanId: args.mealPlanId,
      scheduledDate: args.scheduledDate,
      mealType: "meal_plan", // For full meal plans
      mealPlanData: mealPlan.mealPlanData,
      totalCalories: mealPlan.totalCalories,
      totalProtein: mealPlan.totalProtein,
      mealsConsumed: [],
      caloriesConsumed: 0,
      proteinConsumed: 0,
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });

    return scheduledMeal;
  },
});

export const GetMealPlanForDate = query({
  args: {
    userId: v.id("Users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const scheduledMeal = await ctx.db
      .query("ScheduledMeals")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("scheduledDate"), args.date))
      .first();

    return scheduledMeal;
  },
});

export const ToggleMealConsumed = mutation({
  args: {
    scheduledMealId: v.id("ScheduledMeals"),
    mealType: v.string(),
    calories: v.number(),
    protein: v.number(),
    consumed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const scheduledMeal = await ctx.db.get(args.scheduledMealId);
    if (!scheduledMeal) {
      throw new Error("Scheduled meal not found");
    }

    let mealsConsumed = scheduledMeal.mealsConsumed || [];
    let caloriesConsumed = scheduledMeal.caloriesConsumed || 0;
    let proteinConsumed = scheduledMeal.proteinConsumed || 0;

    if (args.consumed) {
      // Add meal to consumed list if not already there
      if (!mealsConsumed.includes(args.mealType)) {
        mealsConsumed.push(args.mealType);
        caloriesConsumed += args.calories;
        proteinConsumed += args.protein;
      }
    } else {
      // Remove meal from consumed list
      mealsConsumed = mealsConsumed.filter(meal => meal !== args.mealType);
      caloriesConsumed -= args.calories;
      proteinConsumed -= args.protein;
      
      // Ensure values don't go negative
      caloriesConsumed = Math.max(0, caloriesConsumed);
      proteinConsumed = Math.max(0, proteinConsumed);
    }

    await ctx.db.patch(args.scheduledMealId, {
      mealsConsumed,
      caloriesConsumed,
      proteinConsumed,
    });

    return {
      mealsConsumed,
      caloriesConsumed,
      proteinConsumed,
    };
  },
});

// Water Tracking Functions
export const GetWaterTracking = query({
  args: {
    userId: v.id("Users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const waterData = await ctx.db
      .query("WaterTracking")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    return waterData;
  },
});

export const AddWaterIntake = mutation({
  args: {
    userId: v.id("Users"),
    date: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const existingRecord = await ctx.db
      .query("WaterTracking")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("date"), args.date))
      .first();

    const currentTime = new Date().toISOString();

    if (existingRecord) {
      // Update existing record
      const newWaterConsumed = existingRecord.waterConsumed + args.amount;
      const newGlasses = [
        ...existingRecord.glasses,
        {
          time: currentTime,
          amount: args.amount,
        },
      ];

      await ctx.db.patch(existingRecord._id, {
        waterConsumed: newWaterConsumed,
        lastUpdated: currentTime,
        glasses: newGlasses,
      });

      return { waterConsumed: newWaterConsumed };
    } else {
      // Create new record
      const newRecord = await ctx.db.insert("WaterTracking", {
        userId: args.userId,
        date: args.date,
        waterConsumed: args.amount,
        lastUpdated: currentTime,
        glasses: [
          {
            time: currentTime,
            amount: args.amount,
          },
        ],
      });

      return { waterConsumed: args.amount };
    }
  },
});

// Custom Recipe Functions
export const SaveCustomRecipe = mutation({
  args: {
    userId: v.id("Users"),
    recipeName: v.string(),
    ingredients: v.array(v.string()),
    instructions: v.array(v.string()),
    calories: v.number(),
    protein: v.number(),
    cookingTime: v.string(),
    servings: v.number(),
    mealType: v.string(),
    favoriteDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const customRecipeId = await ctx.db.insert("CustomRecipes", {
      userId: args.userId,
      recipeName: args.recipeName,
      ingredients: args.ingredients,
      instructions: args.instructions,
      calories: args.calories,
      protein: args.protein,
      cookingTime: args.cookingTime,
      servings: args.servings,
      mealType: args.mealType,
      favoriteDate: args.favoriteDate,
      createdAt: new Date().toISOString(),
      isActive: true,
      tags: args.tags || [],
    });

    return customRecipeId;
  },
});

export const GetCustomRecipes = query({
  args: {
    userId: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const customRecipes = await ctx.db
      .query("CustomRecipes")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();

    return customRecipes;
  },
});

export const GetRecipeByUser = query({
  args: {
    uid: v.id("Users"),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("Recipes")
      .filter((q) => q.eq(q.field("userId"), args.uid))
      .order("desc")
      .collect();

    return recipes;
  },
});

export const ScheduleMeal = mutation({
  args: {
    userId: v.id("Users"),
    recipeId: v.optional(v.id("Recipes")),
    customRecipeId: v.optional(v.id("CustomRecipes")),
    scheduledDate: v.string(),
    mealType: v.string(),
    totalCalories: v.number(),
    totalProtein: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if there's already a scheduled meal for this user, date, and meal type
    const existingMeal = await ctx.db
      .query("ScheduledMeals")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("scheduledDate"), args.scheduledDate))
      .filter((q) => q.eq(q.field("mealType"), args.mealType))
      .first();

    if (existingMeal) {
      // Update existing meal
      await ctx.db.patch(existingMeal._id, {
        recipeId: args.recipeId,
        customRecipeId: args.customRecipeId,
        totalCalories: args.totalCalories,
        totalProtein: args.totalProtein,
        lastUpdated: new Date().toISOString(),
      });
      return existingMeal._id;
    } else {
      // Create new scheduled meal
      const scheduledMealId = await ctx.db.insert("ScheduledMeals", {
        userId: args.userId,
        recipeId: args.recipeId,
        customRecipeId: args.customRecipeId,
        scheduledDate: args.scheduledDate,
        mealType: args.mealType,
        totalCalories: args.totalCalories,
        totalProtein: args.totalProtein,
        mealsConsumed: [],
        caloriesConsumed: 0,
        proteinConsumed: 0,
        isCompleted: false,
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });

      return scheduledMealId;
    }
  },
});

export const GetScheduledMealsForDate = query({
  args: {
    userId: v.id("Users"),
    scheduledDate: v.string(),
  },
  handler: async (ctx, args) => {
    const scheduledMeals = await ctx.db
      .query("ScheduledMeals")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .filter((q) => q.eq(q.field("scheduledDate"), args.scheduledDate))
      .collect();

    // Get recipe details for each scheduled meal
    const mealsWithDetails = await Promise.all(
      scheduledMeals.map(async (meal) => {
        let recipeDetails = null;
        
        if (meal.recipeId) {
          // Get AI recipe details
          recipeDetails = await ctx.db.get(meal.recipeId);
        } else if (meal.customRecipeId) {
          // Get custom recipe details
          recipeDetails = await ctx.db.get(meal.customRecipeId);
        }

        return {
          ...meal,
          recipeDetails,
        };
      })
    );

    return mealsWithDetails;
  },
});
