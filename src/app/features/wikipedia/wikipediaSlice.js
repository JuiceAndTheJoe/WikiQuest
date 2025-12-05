import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getPageSummary } from '../../models/wikipediaModel';

// Async thunk for fetching Wikipedia page summary + plain-text full content
export const fetchWikipediaPage = createAsyncThunk(
  'wikipedia/fetchPage',
  async (pageTitle, { rejectWithValue, signal }) => {
    try {
      const summary = await getPageSummary(pageTitle, signal);
      return { summary };
    } catch (error) {
      if (error.name === 'AbortError') {
        // Let createAsyncThunk handle cancellation (it sets .meta.aborted)
        throw error;
      }
      return rejectWithValue(error.message || 'Failed to fetch Wikipedia page');
    }
  }
);

const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    pageData: null, // { summary }
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWikipediaPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWikipediaPage.fulfilled, (state, action) => {
        state.loading = false;
        state.pageData = action.payload; // { summary }
        state.error = null;
      })
      .addCase(fetchWikipediaPage.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          'Failed to fetch Wikipedia page';
      });
  },
});

export default wikipediaSlice.reducer;
