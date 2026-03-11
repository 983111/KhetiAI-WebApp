import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askAgriAgent(message: string, context?: string) {
  const systemInstruction = `You are AgriIntel, an Autonomous Agriculture Intelligence Agent for Indian farmers. 
Your goal is to provide expert advice on farming, weather, fertilizers, market prices, and loan eligibility.
Be concise, practical, and empathetic to farmers' needs. Use simple language.
${context ? `Context: ${context}` : ''}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: message,
    config: {
      systemInstruction,
    },
  });

  return response.text;
}

export async function analyzeCropDisease(base64Image: string, mimeType: string) {
  const systemInstruction = `You are an expert plant pathologist and agronomist.
Analyze the provided image of a crop/plant.
Identify any visible diseases, pests, or nutrient deficiencies.
Provide:
1. Diagnosis (What is wrong?)
2. Confidence level (High/Medium/Low)
3. Recommended Treatment (Chemical and Organic options)
4. Preventive Measures`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this crop image for diseases or issues.",
        },
      ],
    },
    config: {
      systemInstruction,
    },
  });
  
  // Find text part
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) {
      return part.text;
    }
  }
  return "Could not analyze the image.";
}

export async function getMarketForecast(crop: string) {
  const systemInstruction = `You are an agricultural economist specializing in Indian markets.
Provide a short-term (next 3 months) price forecast for the requested crop.
Return the response in JSON format matching this schema:
{
  "currentPrice": number (price per quintal in INR),
  "trend": "up" | "down" | "stable",
  "forecast": [
    { "month": string, "price": number },
    { "month": string, "price": number },
    { "month": string, "price": number }
  ],
  "analysis": string (short explanation of market factors)
}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide market forecast for ${crop}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentPrice: { type: Type.NUMBER },
          trend: { type: Type.STRING },
          forecast: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                month: { type: Type.STRING },
                price: { type: Type.NUMBER }
              }
            }
          },
          analysis: { type: Type.STRING }
        }
      }
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse market forecast JSON", e);
    return null;
  }
}
