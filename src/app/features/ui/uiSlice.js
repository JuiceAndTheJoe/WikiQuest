import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getGetStartedClicks } from '../../firestoreModel';

// UI slice: tracks interactions like Get Started button clicks.
// Pure application state; no persistence side effects here.
export const fetchGetStartedClicks = createAsyncThunk('ui/fetchGetStartedClicks', async (userId) => {
    const count = await getGetStartedClicks(userId);
    return count;
});

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        getStartedClicks: 0,
        loading: false,
    },
    reducers: {
        getStartedClicked(state) {
            state.getStartedClicks += 1;
        },
        resetGetStarted(state) {
            state.getStartedClicks = 0;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchGetStartedClicks.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchGetStartedClicks.fulfilled, (state, action) => {
                state.loading = false;
                state.getStartedClicks = action.payload;
            })
            .addCase(fetchGetStartedClicks.rejected, (state) => {
                state.loading = false; // keep existing value if fetch fails
            });
    }
});

export const { getStartedClicked, resetGetStarted } = uiSlice.actions;
export default uiSlice.reducer;
