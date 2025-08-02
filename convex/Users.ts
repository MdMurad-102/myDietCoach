import { mutation, query } from "./_generated/server";

import { v } from "convex/values";

export const CreateNewUsers = mutation({
  args: {
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("Users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    if (user?.length == 0) {
      const data = {
        name: args.name,
        email: args.email,
        credit: 10,
        dailyWaterGoal: 8, // Default 8 glasses/day
      };
      await ctx.db.insert("Users", data);
      return data;
    }
    return user[0];
  },
});

export const GetUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("Users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    return user[0] || null;
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("Users"),
    weight: v.string(),
    height: v.string(),
    gender: v.string(),
    goal: v.string(),
    age: v.string(),
    calories: v.number(),
    proteins: v.number(),
    country: v.string(),
    city: v.string(),
    dietType: v.string(),
    dailyWaterGoal: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      weight: args.weight,
      height: args.height,
      gender: args.gender,
      goal: args.goal,
      age: args.age,
      calories: args.calories,
      proteins: args.proteins,
      country: args.country,
      city: args.city,
      dietType: args.dietType,
    };

    if (args.dailyWaterGoal !== undefined) {
      updateData.dailyWaterGoal = args.dailyWaterGoal;
    }

    await ctx.db.patch(args.id, updateData);
  },
});

export const updateWaterGoal = mutation({
  args: {
    userId: v.id("Users"),
    dailyWaterGoal: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      dailyWaterGoal: args.dailyWaterGoal,
    });
  },
});
