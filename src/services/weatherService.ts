
const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast";

export type WeatherData = {
  location: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  maxTemperature: number;
  minTemperature: number;
  rainProbability: number;
};

type GeoResponse = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    country_code: string;
    admin1?: string;
  }[];
};

export async function getWeather(
  district: string,
  state: string
): Promise<WeatherData> {
  // 1. Convert district and state into coordinates
  const searchQuery = `${district}, ${state}, India`;

  const geoResponse = await fetch(
    `${GEOCODING_URL}?name=${encodeURIComponent(
      searchQuery
    )}&count=10&language=en&format=json&countryCode=IN`
  );

  if (!geoResponse.ok) {
    throw new Error("Unable to find your location.");
  }

  const geoData: GeoResponse = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error(
      "Location not found. Please check your district and state."
    );
  }

  const normalizedState = state.trim().toLowerCase();

  const matchedLocation =
    geoData.results.find(
      (item) =>
        item.admin1?.trim().toLowerCase() === normalizedState
    ) ?? geoData.results[0];

  const { latitude, longitude, name } = matchedLocation;

  // 2. Fetch current weather and 7-day forecast
  const weatherResponse = await fetch(
    `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&forecast_days=7&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error("Unable to fetch weather information.");
  }

  const weather = await weatherResponse.json();

  if (!weather.current || !weather.daily) {
    throw new Error("Weather data is unavailable.");
  }

  return {
    location: name,
    temperature: weather.current.temperature_2m,
    humidity: weather.current.relative_humidity_2m,
    precipitation: weather.current.precipitation,
    windSpeed: weather.current.wind_speed_10m,
    maxTemperature: weather.daily.temperature_2m_max[0],
    minTemperature: weather.daily.temperature_2m_min[0],
    rainProbability:
      weather.daily.precipitation_probability_max[0],
  };
}
