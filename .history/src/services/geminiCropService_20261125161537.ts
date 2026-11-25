const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.8-flash";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";

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

type InteractionResponse = {
  status?: string;
  output_text?: string;
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

const responseSchema = {
  type: "object",
  properties: {
    crops: {
      type: "array",
      description: "Two or three possible crop options for the given farm.",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Crop name." },
          duration: {
            type: "string",
            description: "Indicative crop duration, expressed as a range in days.",
          },
          reason: {
            type: "string",
            description: "Short explanation based on the provided farm inputs.",
          },
        },
        required: ["name", "duration", "reason"],
      },
    },
    generalAdvice: {
      type: "string",
      description: "One or two practical, non-prescriptive points for this farm.",
    },
    caution: {
      type: "string",
      description: "A brief note explaining what should be verified locally.",
    },
  },
  required: ["crops", "generalAdvice", "caution"],
};

function buildPrompt(input: GeminiCropInput): string {
  const weatherText = input.weather
    ? JSON.stringify(input.weather, null, 2)
    : "No weather data was fetched by the farmer.";

  return `You are an agricultural crop advisory assistant for farmers in India.

Suggest suitable crop options using the following farmer-provided information and general agronomic knowledge. Do not claim that your output is a certified recommendation.

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
1. Return 2 or 3 plausible crop options suitable for the stated season and location.
2. Consider soil, irrigation, previous crop/rotation, and weather data when supplied.
3. Do not invent soil NPK values, soil test results, rainfall forecasts, market prices, MSP, profit, yield, or guaranteed outcomes.
4. If a crucial fact is missing or the inputs are insufficient, say so in generalAdvice or caution rather than guessing.
5. Crop duration must be an approximate range in days and must be labelled indicative in the reason or advice.
6. Do not recommend pesticide or fertilizer dosages.
7. Keep each reason concise and explain why the crop may fit the supplied conditions.
8. Return only JSON matching the response schema. Do not include Markdown fences or extra text.`;
}

export async function getGeminiCropRecommendations(
  input: GeminiCropInput
): Promise<GeminiCropResponse> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your frontend .env file."
    );
  }

  const response = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": GEMINI_API_KEY,
      "Api-Revision": "2026-05-20",
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: buildPrompt(input),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: responseSchema,
      },
    }),
  });

  const rawResponse = await response.text();
  let payload: InteractionResponse;

  try {
    payload = rawResponse ? JSON.parse(rawResponse) : {};
  } catch {
    throw new Error("Gemini returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(
      payload.error?.message || `Gemini request failed (${response.status}).`
    );
  }

  const outputText =
    payload.output_text ||
    payload.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content ?? [])
      .filter((part) => part.type === "text")
      .map((part) => part.text ?? "")
      .join("\n");

  if (!outputText) {
    throw new Error("Gemini did not return crop recommendations.");
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
        typeof crop.name === "string" &&
        typeof crop.duration === "string" &&
        typeof crop.reason === "string"
    )
  ) {
    throw new Error("Gemini returned an unexpected crop recommendation format.");
  }

  return {
    crops: result.crops.slice(0, 3),
    generalAdvice: result.generalAdvice || "Review these options with local agricultural guidance.",
    caution: result.caution || "Confirm suitability with your local agriculture extension office before sowing.",
  };
}
