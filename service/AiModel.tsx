import OpenAI from "openai"

const openai = new OpenAI({
 baseURL: "https://openrouter.ai/api/v1" ,    //"https://openrouter.ai/api/v1",
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
 
})

export const CalculateCalories=async (PROMPT: any)=>await openai.chat.completions.create({
    model: "google/gemma-3-4b-it:free",
    messages: [
      { role: "user", content:PROMPT }
    ],
  })

  //console.log(completion.choices[0].message)


