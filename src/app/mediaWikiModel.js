/**
 * MediaWiki REST API Model
 * Centralizes all Wikipedia API interactions
 * Grade A requirement: Multi-source API integration
 */

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';

/**
 * Fetch page summary from Wikipedia
 * @param {string} title - The title of the Wikipedia page
 * @returns {Promise<Object>} Page summary data
 */
export async function getPageSummary(title) {
    try {
        const encodedTitle = encodeURIComponent(title);
        const response = await fetch(`${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`);

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Wikipedia page:', error);
        throw error;
    }
}

/**
 * Fetch full page content from Wikipedia
 * @param {string} title - The title of the Wikipedia page
 * @returns {Promise<Object>} Page content data
 */
export async function getPageContent(title) {
    try {
        const encodedTitle = encodeURIComponent(title);

        // Use MediaWiki action API with origin=* to avoid CORS issues from the browser.
        // The REST `mobile-sections` endpoint may be blocked by CORS or UA rules in some environments.
        const apiUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedTitle}&format=json&prop=text&origin=*`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();

        // Normalize to the shape expected by the slice (lead.sections / remaining.sections)
        // parse.text["*"] contains the HTML for the page; keep it under lead.sections[0].text
        const html = data?.parse?.text?.['*'] || '';
        const titleFromParse = data?.parse?.title || title;

        return {
            lead: {
                displaytitle: titleFromParse,
                sections: [{
                    id: 0,
                    line: titleFromParse,
                    level: 1,
                    number: '0',
                    fromtitle: titleFromParse,
                    anchor: 'top',
                    text: html,
                }],
            },
            remaining: { sections: [] },
        };
    } catch (error) {
        console.error('Error fetching Wikipedia page content:', error);
        throw error;
    }
}

/**
 * Search Wikipedia pages
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Object>} Search results
 */
export async function searchPages(query, limit = 10) {
    try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(
            `${WIKIPEDIA_API_BASE}/page/search/${encodedQuery}?limit=${limit}`
        );

        if (!response.ok) {
            throw new Error(`Wikipedia API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error searching Wikipedia:', error);
        throw error;
    }
}
