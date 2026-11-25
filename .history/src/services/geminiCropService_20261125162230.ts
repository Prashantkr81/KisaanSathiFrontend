const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type GeminiCrop = {
  name: string;
  duration: string;
  reason: string;
};

export type CropWeatherContext = {
  location?: string;
  temperature?: number;
  humidity?: number;
  precipitation?: number;
  windSpeed?: number;
  maxTemperature?: number;
  minTemperature?: number;
  rainProbability?: number;
};

export type GeminiCropInput = {
  state: string;
  district: string;
  landAreaAcres: number;
  soilType: string;
  season: string;
  irrigation: string;
  previousCrop: string;
  weather?: CropWeatherContext;
};

export type GeminiCropResponse = {
  crops: GeminiCrop[];
  generalAdvice: string;
  caution: string;
};

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  error?: {
    message?: string;
    status?: string;
  };
};

const responseJsonSchema = {
  type: "object",
  properties: {
    crops: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Common crop name." },
          duration: {
            type: "string",
            description: "Indicative crop duration as a range in days.",
          },
          reason: {
            type: "string",
            description: "Short explanation based only on supplied farm details and general agronomic knowledge.",
          },
        },
        required: ["name", "duration", "reason"],
        additionalProperties: false,
      },
    },
    generalAdvice: {
      type: "string",
      description: "One or two practical, non-prescriptive points for this farm.",
    },
    caution: {
      type: "string",
      description: "A brief note explaining what the farmer should verify locally before sowing.",
    },
  },
  required: ["crops", "generalAdvice", "caution"],
  additionalProperties: false,
};

function buildPrompt(input: GeminiCropInput): string {
  const weatherText = input.weather
    ? JSON.stringify(input.weather, null, 2)
    : "No weather data was fetched by the farmer.";

  return `You are an agricultural crop advisory assistant for farmers in India.

Suggest 2 or 3 possible crops for the supplied farm. Treat this as preliminary decision support, not a certified agronomic recommendation.

FARM DETAILS
- State: ${input.state}
- District: ${input.district}
- Land area: ${input.landAreaAcres} acres
- Soil type selected by farmer: ${input.soilType}
- Farming season: ${input.season}
- Irrigation availability: ${input.irrigation}
- Previous crop: ${input.previousCrop}
- Available district-level weather data: ${weatherText}

INSTRUCTIONS
1. Consider location, season, soil type, irrigation, previous crop/rotation and supplied weather values.
2. Suggest only crops that are plausible options to investigate for the stated season and region.
3. Do not invent soil NPK values, soil test results, weather forecasts, rainfall, market prices, MSP, yield, profit or guaranteed outcomes.
4. If important information is missing, mention that limitation in generalAdvice or caution.
5. Express crop duration as an indicative range in days. Do not imply it is guaranteed for every variety or local condition.
6. Do not prescribe pesticide or fertilizer dosages.
7. Keep each reason concise and explain the relevant farm inputs.
8. Return JSON matching the supplied response schema. Do not include Markdown fences or text outside the JSON object.`;
}

function extractResponseText(payload: GeminiApiResponse): string {
  return (payload.candidates?.[0]?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("\n")
    .trim();
}

export async function getGeminiCropRecommendations(
  input: GeminiCropInput
): Promise<GeminiCropResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your frontend .env file and restart Expo."
    );
  }

  let response: Response;
  try {
    response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1400,
          responseMimeType: "application/json",
          responseJsonSchema,
        },
      }),
    });
  } catch {
    throw new Error(
      "Could not reach Gemini. Check your internet connection and browser network/CORS settings."
    );
  }

  const rawBody = await response.text();
  let payload: GeminiApiResponse;

  try {
    payload = rawBody ? (JSON.parse(rawBody) as GeminiApiResponse) : {};
  } catch {
    throw new Error("Gemini returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message ||
        `Gemini request failed with HTTP ${response.status}. Check the API key, model access and quota.`
    );
  }

  if (payload.promptFeedback?.blockReason) {
    throw new Error(
      `Gemini blocked this request: ${payload.promptFeedback.blockReason}. Please review the farm details and try again.`
    );
  }

  const outputText = extractResponseText(payload);
  if (!outputText) {
    const finishReason = payload.candidates?.[0]?.finishReason;
    throw new Error(
      finishReason
        ? `Gemini did not return recommendation text (${finishReason}). Please try again.`
        : "Gemini did not return crop recommendations. Please try again."
    );
  }

  let result: GeminiCropResponse;
  try {
    result = JSON.parse(outputText) as GeminiCropResponse;
  } catch {
    throw new Error("Gemini response was not valid JSON. Please try again.");
  }

  if (
    !Array.isArray(result.crops) ||
    result.crops.length === 0 ||
    !result.crops.every(
      (crop) =>
        typeof crop?.name === "string" &&
        typeof crop?.duration === "string" &&
        typeof crop?.reason === "string"
    ) ||
    typeof result.generalAdvice !== "string" ||
    typeof result.caution !== "string"
  ) {
    throw new Error(
      "Gemini returned an unexpected response format. Please try again."
    );
  }

  return {
    crops: result.crops.slice(0, 3),
    generalAdvice: result.generalAdvice,
    caution: result.caution,
  };
}
