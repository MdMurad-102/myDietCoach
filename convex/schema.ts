import { defineSchema , defineTable } from "convex/server";
import {v} from "convex/values";
export default defineSchema({
     Users:defineTable({
        name:v.string() ,
        email:v.string() ,

        picture:v.optional(v.string()), 
        subscriptionId:v.optional(v.string()),
       credit: v.optional(v.number()) ,
       height:v.optional(v.string()),
       weight:v.optional(v.string()),
       gender:v.optional(v.string()) ,
       goal:v.optional(v.string()),
       age:v.optional(v.string()),
       calories:v.optional(v.number()) ,
       proteins:v.optional(v.number())
     }),
     Recipes:defineTable({
        jsonData: v.any(),
        userId:v.id("Users"),
        imageUrl: v.optional(v.string()),
        recipeName: v.any()
     }),
})
