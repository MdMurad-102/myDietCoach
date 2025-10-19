// AI Prompts for the application
const Prom = {
    CALORIESANDPRO: `

Based on the user's profile data provided above, calculate their daily calorie and protein needs.

Consider:
- Gender, age, weight, height
- Goal (weight loss, maintenance, muscle gain)
- Diet type and preferences
- Activity level (if provided)

Return a JSON object with:
{
  "calories": <number>,
  "protein": <number in grams>
}

Use standard formulas:
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- Adjust based on goal (+/- 300-500 calories)
- Protein: 0.8-1.2g per lb of body weight depending on goal

Only return the JSON object, no additional text.`
};

export default Prom;
