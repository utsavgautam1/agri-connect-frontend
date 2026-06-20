/**
 * advisoryApi.js — Dynamic, weather-aware advisories
 * Place at: src/api/advisoryApi.js
 *
 * Priority order:
 *   1. Real API (if EXPO_PUBLIC_ADVISORY_API_URL is set)
 *   2. Weather-based dynamic advisories (using current Redux weather state)
 *   3. Rich static mock (fallback)
 */
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_ADVISORY_API_URL || null;
const advisoryAxios = BASE_URL
  ? axios.create({ baseURL: BASE_URL, timeout: 15000, headers: { 'Content-Type': 'application/json' } })
  : null;

// ── Dynamic advisory generation based on weather condition ───────────────────
const WEATHER_ADVISORIES = {
  Clear: [
    { category: 'planting', title: 'Ideal Day for Field Work', summary: 'Clear skies and low humidity — perfect for harvesting, weeding, or transplanting.', author: 'Agri-Connect AI', readTimeMin: 2 },
    { category: 'irrigation', title: 'Increase Irrigation Today', summary: 'No rain expected. Ensure crops receive adequate water, especially shallow-rooted vegetables.', author: 'Agri-Connect AI', readTimeMin: 2 },
  ],
  Rain: [
    { category: 'pest', title: 'High Fungal Disease Risk', summary: 'Wet conditions favour fungal outbreaks. Inspect crops for blight, rust, and mildew after rain.', author: 'Agri-Connect AI', readTimeMin: 3 },
    { category: 'irrigation', title: 'Pause Irrigation', summary: 'Natural rainfall is sufficient. Overwatering during rain leads to root rot and nutrient leaching.', author: 'Agri-Connect AI', readTimeMin: 2 },
    { category: 'planting', title: 'Avoid Planting Today', summary: 'Do not plant seeds or transplant seedlings during heavy rain — soil compaction and waterlogging damage young roots.', author: 'Agri-Connect AI', readTimeMin: 2 },
  ],
  Clouds: [
    { category: 'planting', title: 'Good Conditions for Transplanting', summary: 'Overcast skies reduce transplant shock. Today is excellent for moving seedlings from nursery to field.', author: 'Agri-Connect AI', readTimeMin: 2 },
    { category: 'fertilizer', title: 'Apply Fertilizer Now', summary: 'Cloudy conditions minimise fertilizer loss from evaporation. Apply top dressing for best results.', author: 'Agri-Connect AI', readTimeMin: 3 },
  ],
  Thunderstorm: [
    { category: 'planting', title: 'Stay Safe — Suspend Field Work', summary: 'Thunderstorms pose safety risks. Secure farm equipment, check drainage channels, and stay indoors.', author: 'Agri-Connect AI', readTimeMin: 1 },
    { category: 'pest', title: 'Post-Storm Disease Check', summary: 'After storms, inspect crops for physical damage and early signs of fungal infection in damaged tissue.', author: 'Agri-Connect AI', readTimeMin: 3 },
  ],
  Drizzle: [
    { category: 'fertilizer', title: 'Light Rain is Ideal for Foliar Feeding', summary: 'Light drizzle helps foliar fertilizer absorb without runoff. Apply zinc or micronutrient sprays now.', author: 'Agri-Connect AI', readTimeMin: 2 },
  ],
  Mist: [
    { category: 'pest', title: 'Monitor for Late Blight', summary: 'Misty conditions are ideal for Phytophthora late blight on tomatoes and potatoes. Scout fields early morning.', author: 'Agri-Connect AI', readTimeMin: 3 },
  ],
};

// ── Rich static advisory database (Nepal-focused) ────────────────────────────
const STATIC_ADVISORIES = [
  {
    id: 'a1', category: 'planting',
    title: 'Optimal Maize Planting Window in Nepal',
    summary: 'Plant maize in the Terai from mid-March and hills from April-May for maximum yield.',
    content: 'In Nepal\'s Terai, maize sowing begins mid-March when soil temperature exceeds 15°C. Hill regions (800–2000m) should wait until April–May. Use certified seed varieties like Rampur Composite or Arun-2. Plant at 75cm × 25cm spacing with 2–3 seeds per hole. Expected yield: 3–5 tonnes/ha with proper management.',
    tags: ['maize', 'planting', 'Nepal', 'Terai', 'hills'],
    author: 'Nepal Agriculture Research Council (NARC)',
    publishedAt: Date.now() - 86400000 * 1,
    readTimeMin: 4,
  },
  {
    id: 'a2', category: 'pest',
    title: 'Fall Armyworm: Detection and Control in Maize',
    summary: 'Fall Armyworm causes 70% yield loss if uncontrolled. Learn early detection signs.',
    content: 'Fall Armyworm (Spodoptera frugiperda) has been detected across Nepal\'s Terai since 2019. Early signs: small pinholes in leaves, white/yellow stripes, frass in the whorl resembling sawdust. Control: apply Emamectin benzoate 1.9 EC at 425ml/ha or Spinosad 45 SC at 160ml/ha within 7 days of first sign. Avoid chemical spraying after silking stage.',
    tags: ['pest', 'maize', 'armyworm', 'Nepal'],
    author: 'CIMMYT Nepal',
    publishedAt: Date.now() - 86400000 * 3,
    readTimeMin: 6,
  },
  {
    id: 'a3', category: 'irrigation',
    title: 'Drip Irrigation for Vegetables in Nepal Hills',
    summary: 'Drip irrigation reduces water use by 40% and doubles vegetable yield in hill farms.',
    content: 'Hill farmers in Nepal face acute water scarcity for vegetable cultivation. Drip irrigation systems costing NPR 80,000–150,000 per ropani are now subsidized at 50% by the government under the Prime Minister Agriculture Modernisation Project (PMAMP). Tomatoes, cucumbers, and capsicum show the highest response, with yield increases of 80–120%.',
    tags: ['irrigation', 'vegetables', 'hills', 'Nepal'],
    author: 'Department of Agriculture, Nepal',
    publishedAt: Date.now() - 86400000 * 2,
    readTimeMin: 5,
  },
  {
    id: 'a4', category: 'market',
    title: 'Kalimati Market Price Trends: March 2026',
    summary: 'Tomato and onion prices expected to rise 20–30% due to reduced Terai supply.',
    content: 'Kalimati Fruits and Vegetable Market data shows tomato wholesale prices averaging NPR 40–55/kg in February 2026. With dry spell affecting Bara and Parsa districts, prices are forecast to rise NPR 65–80/kg by late March. Farmers with irrigated fields should plan harvest for weeks 12–14 to capture the price premium. Potato prices remain stable at NPR 25–35/kg.',
    tags: ['market', 'tomato', 'onion', 'Kalimati', 'Nepal'],
    author: 'Agri-Connect Market Desk',
    publishedAt: Date.now() - 3600000 * 5,
    readTimeMin: 3,
  },
  {
    id: 'a5', category: 'fertilizer',
    title: 'Organic Composting with Rice Straw in Nepal',
    summary: 'Convert rice straw waste into quality compost in 45 days using the NARC rapid method.',
    content: 'Rice straw burning is a major air pollution source in Nepal\'s Terai. NARC\'s rapid composting method decomposes straw in 45 days using EM (Effective Microorganism) solution. Steps: cut straw into 10cm pieces, add 5% cattle manure, drench with diluted EM solution (1:500), cover with plastic sheet, turn every 10 days. Final compost NPK: N-1.2%, P-0.6%, K-1.8%.',
    tags: ['fertilizer', 'organic', 'compost', 'rice', 'Nepal'],
    author: 'NARC Soil Science Division',
    publishedAt: Date.now() - 86400000 * 7,
    readTimeMin: 5,
  },
  {
    id: 'a6', category: 'planting',
    title: 'Winter Vegetable Calendar for Kathmandu Valley',
    summary: 'Optimal sowing times for 8 key vegetables in Kathmandu Valley (1300m elevation).',
    content: 'Kathmandu Valley farmers: Cauliflower — sow September-October, harvest December-January. Cabbage — sow August-September, harvest November-December. Spinach — sow October-November, harvest December-February. Radish — sow September-October, harvest November-December. Peas — sow October, harvest January-February. Tomato (winter) — sow June-July, transplant August-September.',
    tags: ['planting', 'vegetables', 'Kathmandu', 'calendar'],
    author: 'Horticulture Research Station, Khumaltar',
    publishedAt: Date.now() - 86400000 * 5,
    readTimeMin: 4,
  },
  {
    id: 'a7', category: 'pest',
    title: 'Tomato Leaf Curl Virus: Prevention Guide',
    summary: 'Tomato Leaf Curl Virus (ToLCV) spread by whiteflies causes 80% yield loss. Here\'s how to prevent it.',
    content: 'ToLCV is the most damaging tomato disease in Nepal\'s Terai. The virus is transmitted by silverleaf whitefly (Bemisia tabaci). Prevention: use virus-resistant varieties (Srijana, Manarang), install yellow sticky traps (1/10m²), spray neem oil 5ml/L weekly as preventive, apply imidacloprid 17.8 SL at 125ml/ha if whitefly population exceeds 5 per leaf.',
    tags: ['pest', 'tomato', 'virus', 'whitefly', 'Nepal'],
    author: 'Plant Quarantine and Pesticide Management Centre',
    publishedAt: Date.now() - 86400000 * 4,
    readTimeMin: 5,
  },
  {
    id: 'a8', category: 'market',
    title: 'Government Price Support for Paddy 2025/26',
    summary: 'Nepal government sets minimum support price of NPR 3,500/quintal for fine rice.',
    content: 'The Nepal government has announced minimum support prices (MSP) for paddy crop 2025/26: Fine rice — NPR 3,500/quintal, Coarse rice — NPR 3,200/quintal. Farmers can sell directly to the Food Management and Trading Company (FMTC) at district offices. Bring proof of land ownership and production records. Payment within 15 working days via bank transfer.',
    tags: ['market', 'paddy', 'rice', 'government', 'MSP', 'Nepal'],
    author: 'Ministry of Agriculture and Livestock Development',
    publishedAt: Date.now() - 86400000 * 6,
    readTimeMin: 3,
  },
];

// ── Merge weather-based advisories dynamically ────────────────────────────────
const buildDynamicAdvisories = (weatherCondition) => {
  const weatherBased = (WEATHER_ADVISORIES[weatherCondition] || []).map((a, i) => ({
    id: `w${i}`,
    ...a,
    publishedAt: Date.now() - i * 3600000,
    content: a.summary,
    tags: ['weather', a.category],
    isWeatherBased: true,
  }));
  return [...weatherBased, ...STATIC_ADVISORIES];
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch advisories. Pass weatherCondition from Redux weather state for dynamic content.
 * @param {{ category?: string, limit?: number, weatherCondition?: string }} opts
 */
export const fetchAdvisories = async ({ category, limit = 20, weatherCondition } = {}) => {
  if (advisoryAxios) {
    const { data } = await advisoryAxios.get('/advisory', { params: { category, limit } });
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  const all = buildDynamicAdvisories(weatherCondition);
  const filtered = category ? all.filter((a) => a.category === category) : all;
  return filtered.slice(0, limit);
};

export const fetchAdvisoryById = async (id) => {
  if (advisoryAxios) {
    const { data } = await advisoryAxios.get(`/advisory/${id}`);
    return data;
  }
  await new Promise((r) => setTimeout(r, 200));
  const all = buildDynamicAdvisories();
  return all.find((a) => a.id === id) || null;
};

export const submitAdvisoryQuestion = async ({ question, cropType, location }) => {
  if (advisoryAxios) {
    const { data } = await advisoryAxios.post('/advisory/questions', { question, cropType, location });
    return data;
  }
  await new Promise((r) => setTimeout(r, 800));
  return {
    id: Date.now().toString(),
    status: 'queued',
    estimatedResponseHours: 24,
    message: 'Your question has been submitted. An agronomist will respond within 24 hours.',
  };
};

export default { fetchAdvisories, fetchAdvisoryById, submitAdvisoryQuestion };