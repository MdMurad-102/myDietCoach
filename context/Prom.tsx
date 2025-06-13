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
};
