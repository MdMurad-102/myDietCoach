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

  // List of free models to try in order (fallback mechanism)
  const freeModels = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free"
  ];

  for (const model of freeModels) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const result = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500, // Reduced to avoid limits
        temperature: 0.7,
      });

      console.log(`✅ Success with model: ${model}`);
      return result.choices[0].message.content;
    } catch (error: any) {
      console.warn(`⚠️ Model ${model} failed:`, error.message);

      // If rate limited, wait 2 seconds before trying next model
      if (error.status === 429) {
        console.log("⏳ Rate limited, waiting 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Continue to next model
      continue;
    }
  }

  console.error("❌ All models failed");
  return null;
};

/**
 * Calculates the calorie count for a given food item or meal.
 * @param prompt - The food item or meal description.
 * @returns The estimated calorie count as a string.
 */
export const calculateCalories = async (prompt: string): Promise<string | null> => {
  if (!API_KEY) {
    console.error("❌ Cannot calculate calories: API key is missing");
    console.error("Current API_KEY value:", API_KEY);
    console.error("Environment variable EXPO_PUBLIC_OPENROUTER_API_KEY:", process.env.EXPO_PUBLIC_OPENROUTER_API_KEY);
    return null;
  }

  console.log("✅ API Key is present, making request to OpenRouter");

  // List of free models to try in order
  const freeModels = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.2-3b-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
  ];

  for (const model of freeModels) {
    try {
      console.log(`🤖 Trying model: ${model}`);

      const result = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800, // Reduced tokens for calorie calculation
        temperature: 0.5,
      });

      console.log(`✅ Success with model: ${model}`);
      return result.choices[0].message.content;
    } catch (error: any) {
      console.warn(`⚠️ Model ${model} failed:`, error.message);

      // If rate limited, wait 2 seconds
      if (error.status === 429) {
        console.log("⏳ Rate limited, waiting 2 seconds...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      continue;
    }
  }

  console.error("❌ All models failed for calorie calculation");
  return null;
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
      model: "google/gemini-2.0-flash-exp:free",
      max_tokens: 1500,
      temperature: 0.7,
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
