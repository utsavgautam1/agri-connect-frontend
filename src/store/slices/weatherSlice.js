import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Location from 'expo-location';
import { fetchWeatherBundle } from '../../api/weatherApi';


export const loadWeather = createAsyncThunk(
  'weather/loadWeather',
  async (arg, { rejectWithValue }) => {
    try {
      const { isRefresh: _, ...coordsFromArg } = arg || {};
      let coords = (coordsFromArg.lat && coordsFromArg.lon) ? coordsFromArg : null;
      let locationName = null;

      if (!coords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return rejectWithValue('Location permission denied. Please enable it in Settings.');
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        coords = {
          lat: location.coords.latitude,
          lon: location.coords.longitude,
        };

        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude:  coords.lat,
            longitude: coords.lon,
          });

          if (place) {
            const parts = [
              place.subregion || place.district,
              place.city || place.region,
            ].filter(Boolean);

            locationName = parts.length > 0
              ? parts.join(', ')
              : place.name || place.region || null;
          }
        } catch (_) {
          locationName = null;
        }
      }

      const bundle = await fetchWeatherBundle(coords);

      if (locationName && bundle.current) {
        bundle.current.city = locationName;
      }

      return { ...bundle, coords };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load weather.');
    }
  }
);


const initialState = {
  current:      null,
  forecast:     [],
  coords:       null,
  isLoading:    false,
  isRefreshing: false,
  error:        null,
  lastUpdated:  null,
};


const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearWeatherError(state) {
      state.error = null;
    },
    clearWeather() {
      return initialState;
    },
    setRefreshing(state, action) {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWeather.pending, (state, action) => {
        const isRefresh = action.meta.arg?.isRefresh === true;
        if (isRefresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(loadWeather.fulfilled, (state, action) => {
        const { current, forecast, coords } = action.payload;
        state.current     = current;
        state.forecast    = forecast;
        state.coords      = coords;
        state.isLoading   = false;
        state.isRefreshing = false;
        state.error       = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadWeather.rejected, (state, action) => {
        state.isLoading   = false;
        state.isRefreshing = false;
        state.error       = action.payload || 'Unknown error';
      });
  },
});

export const { clearWeatherError, clearWeather, setRefreshing } = weatherSlice.actions;

export const selectCurrentWeather   = (state) => state.weather.current;
export const selectForecast         = (state) => state.weather.forecast;
export const selectWeatherLoading   = (state) => state.weather.isLoading;
export const selectWeatherRefreshing = (state) => state.weather.isRefreshing;
export const selectWeatherError     = (state) => state.weather.error;
export const selectLastUpdated      = (state) => state.weather.lastUpdated;
export const selectWeatherCoords    = (state) => state.weather.coords;

export default weatherSlice.reducer;