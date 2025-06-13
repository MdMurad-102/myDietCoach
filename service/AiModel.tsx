import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const GenerateRecipeAi = async (PROMPT: string) => {
  const result = await openai.chat.completions.create({
    model: "google/gemma-3-4b-it:free",
    messages: [{ role: "user", content: PROMPT }],
  });

  // Return just the content for easier usage
  return result.choices[0].message.content;
};

export const CalculateCalories = async (PROMPT: string) => {
  const result = await openai.chat.completions.create({
    model: "google/gemma-3-4b-it:free",
    messages: [{ role: "user", content: PROMPT }],
  });

  return result.choices[0].message.content;
};
