import { v } from "convex/values";
import { mutation } from "./_generated/server";
export const CreateRecipe = mutation({
  args: {
    jsonData: v.any(),
    uid: v.id("Users"),
    recipeName:v.string(),
    imageUrl: v.string()
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
