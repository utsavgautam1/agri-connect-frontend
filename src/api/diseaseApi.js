import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_DISEASE_API_URL || null;
const TIMEOUT_MS = 30000; // AI inference can be slow — 30s timeout

const diseaseAxios = BASE_URL
  ? axios.create({ baseURL: BASE_URL, timeout: TIMEOUT_MS })
  : null;

// ─── Mock AI Response ────────────────────────────────────────────────────────
const MOCK_DIAGNOSES = [
  {
    disease: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    confidence: 91.4,
    severity: 'High',
    affectedCrop: 'Tomato / Potato',
    symptoms: 'Dark water-soaked lesions on leaves and stems, white mold on undersides in humid conditions.',
    treatment: [
      'Remove and destroy all infected plant parts immediately.',
      'Apply copper-based fungicide (e.g., Copper Oxychloride) every 7–10 days.',
      'Avoid overhead irrigation; water at the base of plants.',
      'Improve field drainage and plant spacing for air circulation.',
    ],
    prevention: 'Use resistant varieties. Apply preventive fungicide before wet season.',
    organicOption: 'Spray diluted neem oil solution weekly as a preventive measure.',
  },
  {
    disease: 'Maize Lethal Necrosis',
    scientificName: 'MCMV + SCMV co-infection',
    confidence: 87.2,
    severity: 'Critical',
    affectedCrop: 'Maize',
    symptoms: 'Yellowing from leaf margins, necrosis of young leaves, premature plant death.',
    treatment: [
      'There is no cure — remove and burn all infected plants.',
      'Control thrips and aphids (vectors) with approved insecticides.',
      'Do not replant maize in the same field for at least 6 months.',
    ],
    prevention: 'Plant certified MLN-tolerant seed varieties. Rotate with non-host crops.',
    organicOption: 'Use sticky yellow traps to monitor and reduce vector insect populations.',
  },
  {
    disease: 'Powdery Mildew',
    scientificName: 'Erysiphe cichoracearum',
    confidence: 95.1,
    severity: 'Moderate',
    affectedCrop: 'Wheat / Beans / Cucurbits',
    symptoms: 'White powdery coating on leaf surfaces, distorted growth, premature leaf drop.',
    treatment: [
      'Apply sulfur-based fungicide early in the infection cycle.',
      'Use potassium bicarbonate spray as an effective treatment.',
      'Prune dense canopy to improve air circulation.',
    ],
    prevention: 'Avoid excessive nitrogen fertilization. Maintain plant spacing.',
    organicOption: 'Spray a solution of 1 tbsp baking soda + 1 tsp neem oil per litre of water.',
  },
];

// ─── Error Classification ─────────────────────────────────────────────────────

const classifyError = (error) => {
  if (!error.response) {
    // No response received — network/timeout issue
    if (error.code === 'ECONNABORTED') {
      return 'The analysis is taking too long. Check your connection and try again.';
    }
    return 'Server unreachable. Please check your internet connection.';
  }

  const status = error.response.status;

  if (status === 413) return 'Image is too large for the server. Please use a smaller photo.';
  if (status === 422) return 'The image could not be processed. Ensure it clearly shows the affected crop area.';
  if (status === 429) return 'Too many requests. Please wait a moment and try again.';
  if (status >= 500) return 'The analysis service is currently down. Please try again later.';

  return error.response.data?.message || 'Analysis failed. Please try a different image.';
};

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Send image to disease detection endpoint.
 *
 * @param {{ uri: string, fileName?: string, type?: string }} imageAsset
 * @param {{ cropType?: string }} options
 * @returns {Promise<DiagnosisResult>}
 */
export const analyzeCropDisease = async (imageAsset, { cropType } = {}) => {
  // ── Mock path ────────────────────────────────────────────────────────────
  if (!diseaseAxios) {
    await new Promise((res) => setTimeout(res, 3200)); // simulate AI processing time
    const mock = MOCK_DIAGNOSES[Math.floor(Math.random() * MOCK_DIAGNOSES.length)];
    return { ...mock, analyzedAt: Date.now() };
  }

  // ── Real API path ─────────────────────────────────────────────────────────
  try {
    const formData = new FormData();

    // React Native FormData accepts this object shape for file uploads
    formData.append('image', {
      uri: imageAsset.uri,
      name: imageAsset.fileName || `crop_scan_${Date.now()}.jpg`,
      type: imageAsset.type || 'image/jpeg',
    });

    if (cropType) {
      formData.append('crop_type', cropType);
    }

    const { data } = await diseaseAxios.post('/disease/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      // Track upload progress (useful for large images)
      onUploadProgress: (progressEvent) => {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        console.log(`Upload: ${percent}%`);
      },
    });

    return { ...data, analyzedAt: Date.now() };
  } catch (error) {
    throw new Error(classifyError(error));
  }
};

/**
 * Fetch a list of common diseases for a given crop type (for offline reference).
 * @param {string} cropType
 */
export const fetchCommonDiseases = async (cropType) => {
  if (!diseaseAxios) {
    await new Promise((res) => setTimeout(res, 300));
    return MOCK_DIAGNOSES.map(({ disease, affectedCrop, severity }) => ({
      disease, affectedCrop, severity,
    }));
  }

  const { data } = await diseaseAxios.get('/disease/common', { params: { crop: cropType } });
  return data;
};

export default { analyzeCropDisease, fetchCommonDiseases };