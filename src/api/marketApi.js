/**
 * marketApi.js — Daily-updating Kalimati Market Prices
 * Place at: src/api/marketApi.js
 *
 * Prices update every day using a date-seeded algorithm that produces
 * realistic fluctuations. When you have the real Kalimati API,
 * replace the mock block with the real fetch.
 */

// ── Base prices (Kalimati realistic NPR/kg averages) ─────────────────────────
const BASE_PRICES = [
  { id:'1',  name:'Tomato',       category:'Vegetables', base:45,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.15 },
  { id:'2',  name:'Potato',       category:'Vegetables', base:30,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.08 },
  { id:'3',  name:'Onion',        category:'Vegetables', base:55,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.12 },
  { id:'4',  name:'Cabbage',      category:'Vegetables', base:25,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.10 },
  { id:'5',  name:'Cauliflower',  category:'Vegetables', base:40,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.12 },
  { id:'6',  name:'Spinach',      category:'Vegetables', base:35,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.18 },
  { id:'7',  name:'Radish',       category:'Vegetables', base:20,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.08 },
  { id:'8',  name:'Carrot',       category:'Vegetables', base:50,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.10 },
  { id:'9',  name:'Bitter Gourd', category:'Vegetables', base:60,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.15 },
  { id:'10', name:'Pumpkin',      category:'Vegetables', base:28,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.08 },
  { id:'11', name:'Capsicum',     category:'Vegetables', base:80,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.20 },
  { id:'12', name:'Cucumber',     category:'Vegetables', base:35,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.12 },
  { id:'13', name:'Maize',        category:'Cereals',    base:32,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.05 },
  { id:'14', name:'Rice (Local)', category:'Cereals',    base:85,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.04 },
  { id:'15', name:'Wheat',        category:'Cereals',    base:40,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.04 },
  { id:'16', name:'Lentil (Dal)', category:'Cereals',    base:120, unit:'kg', market:'Kalimati, Kathmandu', volatility:0.06 },
  { id:'17', name:'Banana',       category:'Fruits',     base:55,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.08 },
  { id:'18', name:'Apple',        category:'Fruits',     base:180, unit:'kg', market:'Kalimati, Kathmandu', volatility:0.10 },
  { id:'19', name:'Orange',       category:'Fruits',     base:90,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.12 },
  { id:'20', name:'Mango',        category:'Fruits',     base:120, unit:'kg', market:'Kalimati, Kathmandu', volatility:0.18 },
  { id:'21', name:'Papaya',       category:'Fruits',     base:45,  unit:'kg', market:'Kalimati, Kathmandu', volatility:0.12 },
  { id:'22', name:'Lemon',        category:'Fruits',     base:5,   unit:'piece', market:'Kalimati, Kathmandu', volatility:0.15 },
];

// ── Deterministic daily price generator ──────────────────────────────────────
// Same date always produces same prices (no flicker on re-render).
// Different date = different prices. volatility controls daily swing range.
const getDailyPrices = (dateOverride) => {
  const date = dateOverride || new Date();
  // Seed: YYYYMMDD integer — changes every day
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  return BASE_PRICES.map((crop, index) => {
    // Pseudo-random but deterministic per (seed, index)
    const r1 = Math.sin(seed * 9301 + index * 49297 + 233) * 0.5 + 0.5;
    const r2 = Math.sin(seed * 7793 + index * 31337 + 113) * 0.5 + 0.5;

    // Change percent within ±(volatility * 100)%
    const changePercent = parseFloat(((r1 - 0.5) * 2 * crop.volatility * 100).toFixed(1));

    const currentPrice = Math.max(1, Math.round(crop.base * (1 + changePercent / 100)));
    const prevPrice    = crop.base; // yesterday's base

    // Weekly trend: another layer of variation
    const weekSeed = Math.floor(seed / 7);
    const weekR = Math.sin(weekSeed * 1234 + index * 567) * 0.5 + 0.5;
    const weekTrend = (weekR - 0.5) * crop.volatility * 50;

    return {
      ...crop,
      currentPrice,
      prevPrice,
      changePercent,
      weekTrend: parseFloat(weekTrend.toFixed(1)),
      updatedAt: date,
      // For historical chart (7 days of prices)
      priceHistory: Array.from({ length: 7 }, (_, i) => {
        const dSeed = (date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()) - i;
        const hr = Math.sin(dSeed * 9301 + index * 49297) * 0.5 + 0.5;
        const hChange = (hr - 0.5) * 2 * crop.volatility * 100;
        return {
          day: i === 0 ? 'Today' : `Day -${i}`,
          price: Math.max(1, Math.round(crop.base * (1 + hChange / 100))),
        };
      }).reverse(),
    };
  });
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch market prices. In production replace with real Kalimati API call.
 * @returns {Promise<Array>}
 */
export const fetchMarketPrices = async () => {
  // TODO: Replace with real Kalimati market API when available:
  // const response = await fetch('https://kalimatimarket.gov.np/api/prices');
  // const data = await response.json();
  // return data;

  // Simulate network latency
  await new Promise((r) => setTimeout(r, 500));
  return getDailyPrices();
};

/**
 * Fetch price history for a single crop (last 7 days).
 */
export const fetchCropPriceHistory = async (cropId) => {
  await new Promise((r) => setTimeout(r, 300));
  const prices = getDailyPrices();
  const crop = prices.find((c) => c.id === cropId);
  return crop?.priceHistory || [];
};

export { getDailyPrices };
export default { fetchMarketPrices, fetchCropPriceHistory };