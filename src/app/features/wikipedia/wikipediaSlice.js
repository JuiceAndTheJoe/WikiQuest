import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPageSummary, getPageContent } from '../../mediaWikiModel';

/**
 * Wikipedia Feature Slice
 * Fetches both the summary and the full page HTML
 * Keeps UI-safe plain text in state (no raw HTML stored)
 */

// Helper to convert HTML to plain readable text
function stripHtml(html = '') {
    let text = '';

    // Prefer DOMParser in browser to correctly decode HTML entities
    try {
        if (typeof window !== 'undefined' && window.DOMParser) {
            const parser = new window.DOMParser();
            const doc = parser.parseFromString(String(html), 'text/html');
            // Prefer the main article container if present to avoid nav/metadata
            let root = doc.querySelector('.mw-parser-output') || doc.body;

            // Remove nodes that are not part of the main readable article
            const removeSelectors = [
                'style',
                'script',
                'table',
                '.infobox',
                '.navbox',
                '.vertical-navbox',
                '.toc',
                '.hatnote',
                '.mw-editsection',
                '.references',
                '.reflist',
                '.mw-references-wrap',
                'sup.reference',
                '.reference',
                '.mw-cite-backlink',
                '.thumb',
                '.gallery',
                '.ambox',
                '.metadata',
            ];

            removeSelectors.forEach((sel) => {
                const nodes = root.querySelectorAll(sel);
                nodes.forEach((n) => n.remove());
            });

            // Remove trailing non-article sections starting at common headings
            try {
                const stopHeadings = [
                    'References',
                    'See also',
                    'External links',
                    'Further reading',
                    'Notes',
                    'Bibliography',
                ];

                const headingNodes = root.querySelectorAll('h2, h3, h4, h5');
                for (const h of headingNodes) {
                    const raw = (h.textContent || '').trim();
                    // strip common '[edit]' suffix and normalize
                    const cleaned = raw.replace(/\[edit\]$/i, '').trim();
                    if (stopHeadings.some((s) => new RegExp('^' + s + '$', 'i').test(cleaned))) {
                        // remove this heading and all following siblings
                        let node = h;
                        while (node) {
                            const next = node.nextSibling;
                            node.remove();
                            node = next;
                        }
                        break;
                    }
                }
            } catch (err) {
                // Non-fatal — proceed with whatever remains
                console.warn('Error trimming trailing sections', err);
            }

            text = root ? root.textContent || '' : '';
        } else if (typeof document !== 'undefined') {
            // Fallback: use a temporary element
            const el = document.createElement('div');
            el.innerHTML = String(html);
            text = el.textContent || el.innerText || '';
        } else {
            // Last-resort fallback: strip tags via regex (loses some decoding)
            text = String(html).replace(/<[^>]+>/g, '');
        }
    } catch (e) {
        // On any error, fallback to regex
        text = String(html).replace(/<[^>]+>/g, '');
    }

    // Remove common reference markers like [5], [10], [a], and [citation needed]
    text = text.replace(/\[\s*[a-z0-9]+\s*\]/gi, '');
    text = text.replace(/\[\s*citation needed\s*\]/gi, '');

    // Normalize whitespace and newlines
    text = text.replace(/\r\n|\r/g, '\n');
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/[ \t]+/g, ' ');
    text = text.replace(/\s+\n/g, '\n');
    // Final safety: cut off at common trailing section headings to avoid references/links
    try {
        const stopIndex = text.search(/(^|\n)\s*(References|See also|External links|Further reading|Notes|Bibliography)\b/i);
        if (stopIndex !== -1) {
            text = text.slice(0, stopIndex);
        }
    } catch (e) {
        // ignore
    }

    return text.trim();
}

// Async thunk for fetching Wikipedia page summary + plain-text full content
export const fetchWikipediaPage = createAsyncThunk(
    'wikipedia/fetchPage',
    async (pageTitle, { rejectWithValue }) => {
        try {
            const summary = await getPageSummary(pageTitle);

            let contentText = null;
            try {
                // getPageContent now returns raw HTML string
                const htmlContent = await getPageContent(pageTitle);

                // Parse the HTML to extract readable text
                contentText = stripHtml(htmlContent);
            } catch (err) {
                // Log and continue — summary is the primary content
                console.warn('Failed to fetch/parse full page content', err);
                contentText = null;
            }

            return { summary, contentText };
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

export default wikipediaSlice.reducer;
