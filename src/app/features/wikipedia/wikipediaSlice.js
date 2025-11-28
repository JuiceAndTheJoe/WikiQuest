import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPageSummary, getPageContent } from '../../mediaWikiModel';
import { stripHtml, htmlToSections, cleanText } from '../../mediaWikiParser';

// Async thunk for fetching Wikipedia page summary + plain-text full content
export const fetchWikipediaPage = createAsyncThunk(
    'wikipedia/fetchPage',
    async (pageTitle, { rejectWithValue }) => {
        try {
            const summary = await getPageSummary(pageTitle);

            let contentText = null;
            let contentSections = null;
            try {
                // getPageContent now returns raw HTML string
                const htmlContent = await getPageContent(pageTitle);

                // Parse the HTML to extract readable text
                contentText = stripHtml(htmlContent);
                // Also parse into structured sections
                const rawSections = htmlToSections(htmlContent);
                contentSections = rawSections.map((s) => ({
                    heading: cleanText(s.heading),
                    text: cleanText(s.text),
                }));
            } catch (err) {
                // Log and continue — summary is the primary content
                console.warn('Failed to fetch/parse full page content', err);
                contentText = null;
                contentSections = null;
            }

            return { summary, contentText, contentSections };
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch Wikipedia page');
        }
    }
);

const wikipediaSlice = createSlice({
    name: 'wikipedia',
    initialState: {
        pageData: null, // { summary, contentText }
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
                state.pageData = action.payload; // { summary, contentText }
                state.lastFetchedTitle = action.payload.summary?.title || null;
                state.error = null;
            })
            .addCase(fetchWikipediaPage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error?.message || 'Failed to fetch Wikipedia page';
            });
    },
});

export const { clearWikipediaData } = wikipediaSlice.actions;

// Selectors
export const selectWikipediaPageData = (state) => state.wikipedia.pageData;
export const selectWikipediaLoading = (state) => state.wikipedia.loading;
export const selectWikipediaError = (state) => state.wikipedia.error;
export const selectWikipediaSections = (state) => state.wikipedia.pageData?.contentSections || null;

export default wikipediaSlice.reducer;
