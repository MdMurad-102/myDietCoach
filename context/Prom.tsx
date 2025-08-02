export default {
  CALORIESANDPRO: `Based on weight , height ,age , gender , goal give me calories and protiens need daily in JSON format and follow the schema:
    {
        calories:<>,
        proteins:<>
    }`,

  GENERATE_RECIPE: `:Depends on user instruction create 3 different Recipe variant with Recipe Name with Emoji, 2 line description and main ingredients list  in JSON with filed RecipeName, Description, Ingredients  (without size) do not give me text response`,
  GENERATE_COMPLITE_RECIPE: `
    -I will provide you with:
- recipeName
- description
- userGoal (possible values: weightLoss, weightGain, muscleGain)
- baseCalories
- protein

Your task:

- Analyze recipeName and description.
- Generate an ingredients list with:
   - ingredient name
   - emoji icon (appropriate for each ingredient)
   - quantity (estimate based on common recipe portions for the userGoal)
- Adjust ingredient portions based on userGoal (weightLoss → lighter portions, weightGain → larger portions, muscleGain → high protein portions).
- Provide total calories as calories (only a number, rounded).
- Estimate total cooking time in minutes.
- Generate a realistic image prompt text describing the dish visually as imagePrompt.
- Select appropriate category for the recipe from: [Breakfast, Lunch, Dinner, Snacks] as category.
- Output ONLY in JSON format. No extra explanation.

JSON Schema format should be:
{
  "recipeName": "string",
  "description": "string",
  "calories": "number,
  "protein": "number",
  category: ["string"],
  "cookTime": "number",
  "imagePrompt": "string",
    "ingredients": [
        {
        "name": "string",
        "emoji": "string",
        "quantity": "string"
        }
    ]
  "serveTo": "number",
  steps: ["string"],
}`,

  GENERATE_DAILY_MEAL_PLAN: `
You are a professional nutritionist and chef. Create a complete daily meal plan with 4 detailed recipes based on user profile.

User Profile Information:
- Daily Calories Target: [calories] kcal
- Daily Protein Target: [proteins]g  
- Location: [city], [country]
- Diet Type: [dietType] (vegetarian/non-vegetarian)
- Fitness Goal: [goal] (weightLoss/weightGain/muscleGain)

Requirements:
1. Create 4 complete recipes: Breakfast, Lunch, Dinner, and Snacks
2. Each recipe must include detailed ingredients with exact quantities
3. Provide step-by-step cooking instructions
4. Use local cuisine and ingredients from user's location
5. Respect dietary preferences strictly
6. Distribute calories: Breakfast 25%, Lunch 35%, Dinner 30%, Snacks 10%
7. Ensure protein is distributed evenly across meals
8. Include cooking time, prep time, and difficulty level
9. Generate realistic image description for each dish
10. Use ingredients commonly available in [country]

Output ONLY valid JSON format:

{
  "planName": "Daily Meal Plan - [current date]",
  "totalCalories": [total calories number],
  "totalProtein": [total protein number],
  "location": "[city], [country]",
  "dietType": "[dietType]",
  "meals": [
    {
      "mealType": "Breakfast",
      "recipeName": "Traditional [country] breakfast name with emoji",
      "description": "2-3 line appetizing description",
      "calories": [breakfast calories - 25% of total],
      "protein": [breakfast protein in grams],
      "prepTime": [prep time in minutes],
      "cookTime": [cooking time in minutes],
      "difficulty": "Easy/Medium/Hard",
      "servings": 1,
      "imagePrompt": "Detailed visual description of the prepared dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "emoji": "🥚",
          "quantity": "exact amount with unit",
          "notes": "optional preparation note"
        }
      ],
      "instructions": [
        "Step 1: Detailed cooking instruction",
        "Step 2: Next step with specific details",
        "Step 3: Continue until completion"
      ],
      "nutritionTips": "Brief nutrition benefit of this meal"
    },
    {
      "mealType": "Lunch", 
      "recipeName": "Local [country] lunch dish with emoji",
      "description": "2-3 line appetizing description",
      "calories": [lunch calories - 35% of total],
      "protein": [lunch protein in grams],
      "prepTime": [prep time in minutes],
      "cookTime": [cooking time in minutes], 
      "difficulty": "Easy/Medium/Hard",
      "servings": 1,
      "imagePrompt": "Detailed visual description of the prepared dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "emoji": "🍗", 
          "quantity": "exact amount with unit",
          "notes": "optional preparation note"
        }
      ],
      "instructions": [
        "Step 1: Detailed cooking instruction",
        "Step 2: Next step with specific details"
      ],
      "nutritionTips": "Brief nutrition benefit of this meal"
    },
    {
      "mealType": "Dinner",
      "recipeName": "Traditional [country] dinner with emoji", 
      "description": "2-3 line appetizing description",
      "calories": [dinner calories - 30% of total],
      "protein": [dinner protein in grams],
      "prepTime": [prep time in minutes],
      "cookTime": [cooking time in minutes],
      "difficulty": "Easy/Medium/Hard", 
      "servings": 1,
      "imagePrompt": "Detailed visual description of the prepared dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "emoji": "🍛",
          "quantity": "exact amount with unit", 
          "notes": "optional preparation note"
        }
      ],
      "instructions": [
        "Step 1: Detailed cooking instruction",
        "Step 2: Next step with specific details"
      ],
      "nutritionTips": "Brief nutrition benefit of this meal"
    },
    {
      "mealType": "Snacks",
      "recipeName": "Healthy [country] snack with emoji",
      "description": "2-3 line appetizing description", 
      "calories": [snack calories - 10% of total],
      "protein": [snack protein in grams],
      "prepTime": [prep time in minutes],
      "cookTime": [cooking time in minutes],
      "difficulty": "Easy/Medium/Hard",
      "servings": 1, 
      "imagePrompt": "Detailed visual description of the prepared dish",
      "ingredients": [
        {
          "name": "ingredient name",
          "emoji": "🥜",
          "quantity": "exact amount with unit",
          "notes": "optional preparation note" 
        }
      ],
      "instructions": [
        "Step 1: Detailed preparation instruction",
        "Step 2: Next step if needed"
      ],
      "nutritionTips": "Brief nutrition benefit of this snack"
    }
  ]
}`,
};
