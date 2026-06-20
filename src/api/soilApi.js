import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_SOIL_API_URL || null;

const soilAxios = BASE_URL
  ? axios.create({ baseURL: BASE_URL, timeout: 12000, headers: { 'Content-Type': 'application/json' } })
  : null;

// ── Mock crop recommendation data ─────────────────────────────────────────────
const MOCK_RECOMMENDATIONS = {
  high_n:   ['Maize', 'Spinach', 'Cabbage', 'Lettuce'],
  high_p:   ['Potatoes', 'Carrots', 'Cassava', 'Yams'],
  high_k:   ['Banana', 'Coffee', 'Sugarcane', 'Avocado'],
  balanced: ['Tomatoes', 'Beans', 'Wheat', 'Sorghum'],
  acidic:   ['Tea', 'Blueberries', 'Sweet Potatoes'],
  neutral:  ['Maize', 'Tomatoes', 'Pepper', 'Sunflower'],
  alkaline: ['Asparagus', 'Cabbage', 'Brassicas'],
};

const MOCK_AMENDMENTS = [
  { condition: 'n_deficiency', product: 'Urea (46-0-0)',        rate: '50 kg/acre', timing: 'Before planting' },
  { condition: 'p_deficiency', product: 'DAP (18-46-0)',         rate: '40 kg/acre', timing: 'At planting' },
  { condition: 'k_deficiency', product: 'MOP (0-0-60)',          rate: '30 kg/acre', timing: 'Before planting' },
  { condition: 'acidic',       product: 'Agricultural Lime',     rate: '1 tonne/acre', timing: '3 months before planting' },
  { condition: 'alkaline',     product: 'Elemental Sulfur',      rate: '100 kg/acre', timing: '1 month before planting' },
];

/**
 * Submit soil readings for AI-based crop recommendations.
 * @param {{ n: number, p: number, k: number, ph: number, location?: string }} readings
 */
export const submitSoilReadings = async (readings) => {
  if (soilAxios) {
    const { data } = await soilAxios.post('/soil/analyze', readings);
    return data;
  }

  // Mock response
  await new Promise((r) => setTimeout(r, 800));

  const { n, p, k, ph } = readings;
  const recommendations = new Set();

  if (n >= 40) MOCK_RECOMMENDATIONS.high_n.forEach((c) => recommendations.add(c));
  if (p >= 30) MOCK_RECOMMENDATIONS.high_p.forEach((c) => recommendations.add(c));
  if (k >= 30) MOCK_RECOMMENDATIONS.high_k.forEach((c) => recommendations.add(c));
  if (n >= 20 && p >= 15 && k >= 15) MOCK_RECOMMENDATIONS.balanced.forEach((c) => recommendations.add(c));

  const phCategory = ph < 5.5 ? 'acidic' : ph > 7.5 ? 'alkaline' : 'neutral';
  MOCK_RECOMMENDATIONS[phCategory].forEach((c) => recommendations.add(c));

  const amendments = MOCK_AMENDMENTS.filter(({ condition }) => {
    if (condition === 'n_deficiency' && n < 15) return true;
    if (condition === 'p_deficiency' && p < 10) return true;
    if (condition === 'k_deficiency' && k < 10) return true;
    if (condition === 'acidic'       && ph < 5.5) return true;
    if (condition === 'alkaline'     && ph > 7.5) return true;
    return false;
  });

  return {
    recommendations: [...recommendations].slice(0, 6),
    amendments,
    phCategory,
    soilHealth: n >= 20 && p >= 15 && k >= 15 ? 'Good' : amendments.length > 2 ? 'Poor' : 'Fair',
    analyzedAt: Date.now(),
  };
};

/**
 * Fetch historical soil readings for the current user.
 */
export const fetchSoilHistory = async () => {
  if (soilAxios) {
    const { data } = await soilAxios.get('/soil/history');
    return data;
  }
  await new Promise((r) => setTimeout(r, 400));
  // Return empty array — no history in mock
  return [];
};

export default { submitSoilReadings, fetchSoilHistory };