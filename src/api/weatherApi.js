import { OPENWEATHER_KEY, WEATHER_BASE_URL } from '@env';

const BASE_URL = WEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';
const API_KEY  = OPENWEATHER_KEY || 'a0c99f8b1eb0875d4338405299913d76';

// ── Fetch by GPS coordinates ───────────────────────────────────────────────────
export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=5`),
    ]);
    if (!currentRes.ok) {
      const err = await currentRes.json();
      throw new Error(err.message || 'Failed to fetch weather');
    }
    const current  = await currentRes.json();
    const forecast = await forecastRes.json();
    return { current: parseCurrentWeather(current), forecast: parseForecast(forecast) };
  } catch (error) {
    throw new Error(error.message || 'Weather fetch failed');
  }
};

// ── Fetch by city name (fallback if no GPS) ───────────────────────────────────
export const fetchWeatherByCity = async (city = 'Kathmandu') => {
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric&cnt=5`),
    ]);
    if (!currentRes.ok) {
      const err = await currentRes.json();
      throw new Error(err.message || 'Failed to fetch weather');
    }
    const current  = await currentRes.json();
    const forecast = await forecastRes.json();
    return { current: parseCurrentWeather(current), forecast: parseForecast(forecast) };
  } catch (error) {
    throw new Error(error.message || 'Weather fetch failed');
  }
};

// ── Unified entry point used by weatherSlice ──────────────────────────────────
export const fetchWeatherBundle = async (coords) => {
  if (coords?.lat && coords?.lon) {
    return fetchWeatherByCoords(coords.lat, coords.lon);
  }
  return fetchWeatherByCity('Kathmandu');
};

// ── Parsers ───────────────────────────────────────────────────────────────────
const parseCurrentWeather = (data) => ({
  city:        data.name,
  country:     data.sys.country,
  temperature: Math.round(data.main.temp),
  feelsLike:   Math.round(data.main.feels_like),
  tempMin:     Math.round(data.main.temp_min),
  tempMax:     Math.round(data.main.temp_max),
  humidity:    data.main.humidity,
  pressure:    data.main.pressure,
  visibility:  data.visibility ? Math.round(data.visibility / 1000) : null,
  windSpeed:   data.wind.speed,
  windDeg:     data.wind.deg,
  condition:   data.weather[0].main,
  description: data.weather[0].description,
  icon:        data.weather[0].icon,
  iconUrl:     `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
  sunrise:     data.sys.sunrise * 1000,
  sunset:      data.sys.sunset  * 1000,
  lat:         data.coord.lat,
  lon:         data.coord.lon,
});

const parseForecast = (data) =>
  data.list.map((item) => ({
    dt:          item.dt * 1000,
    day:         new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    temperature: Math.round(item.main.temp),
    tempMin:     Math.round(item.main.temp_min),
    tempMax:     Math.round(item.main.temp_max),
    humidity:    item.main.humidity,
    pop:         Math.round((item.pop || 0) * 100),
    condition:   item.weather[0].main,
    description: item.weather[0].description,
    icon:        item.weather[0].icon,
    iconUrl:     `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
  }));