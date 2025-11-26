import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPageSummary } from '../../mediaWikiModel';

/**
 * Wikipedia Feature Slice
 * Manages Wikipedia page data state
 * Grade A requirement: Multi-source API integration
 */

// Async thunk for fetching Wikipedia page summary
export const fetchWikipediaPage = createAsyncThunk(
    'wikipedia/fetchPage',
    async (pageTitle, { rejectWithValue }) => {
        try {
            const data = await getPageSummary(pageTitle);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const wikipediaSlice = createSlice({
    name: 'wikipedia',
    initialState: {
        pageData: null,
        loading: false,
        error: null,
        lastFetchedTitle: null,
    },
    reducers: {
        clearWikipediaData: (state) => {
            state.pageData = null;
            state.error = null;
            state.lastFetchedTitle = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWikipediaPage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWikipediaPage.fulfilled, (state, action) => {
                state.loading = false;
                state.pageData = action.payload;
                state.lastFetchedTitle = action.payload.title;
                state.error = null;
            })
            .addCase(fetchWikipediaPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to fetch Wikipedia page';
            });
    },
});

export const { clearWikipediaData } = wikipediaSlice.actions;
export default wikipediaSlice.reducer;
