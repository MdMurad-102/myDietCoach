import OpenAI from "openai";

// Validate API key
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ EXPO_PUBLIC_OPENROUTER_API_KEY is not set. AI features will not work.");
}

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: API_KEY || "dummy-key", // Provide fallback to prevent initialization error
  dangerouslyAllowBrowser: true,
});

/**
 * Generates a recipe based on a text prompt.
 * @param prompt - The user's request for a recipe.
 * @returns The generated recipe as a string.
 */
export const generateRecipeFromText = async (prompt: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("❌ Cannot generate recipe: API key is missing");
    return null;
  }

  try {
    const result = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error generating recipe from text:", error);
    return null;
  }
};

/**
 * Calculates the calorie count for a given food item or meal.
 * @param prompt - The food item or meal description.
 * @returns The estimated calorie count as a string.
 */
export const calculateCalories = async (prompt: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("❌ Cannot calculate calories: API key is missing");
    return null;
  }

  try {
    const result = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error calculating calories:", error);
    return null;
  }
};

/**
 * Generates a recipe from an image.
 * @param imageUrl - The URL of the image to process.
 * @returns The generated recipe as a string.
 */
export const generateRecipeFromImage = async (base64Image: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("❌ Cannot generate recipe from image: API key is missing");
    return null;
  }

  try {
    const result = await openai.chat.completions.create({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What’s in this image? Provide a detailed recipe with ingredients and instructions." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error generating recipe from image:", error);
    return null;
  }
};
