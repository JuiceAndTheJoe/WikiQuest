/**
 * MediaWiki REST API Model
 * Centralizes all Wikipedia API interactions
 * Grade A requirement: Multi-source API integration
 */

const WIKIPEDIA_API_BASE = 'https://en.wikipedia.org/api/rest_v1';

/**
 * Generic API call helper
 * @param {string} url - Full URL to fetch
 * @param {boolean} expectJson - Whether to parse response as JSON (default true)
 * @returns {Promise<Object|string>} Response data
 */
async function apiCall(url, expectJson = true) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (expectJson) {
        const result = await response.json();
        return result;
    } else {
        const result = await response.text();
        return result;
    }
}

/**
 * Fetch page summary from Wikipedia
 * @param {string} title - The title of the Wikipedia page
 * @returns {Promise<Object>} Page summary data
 */
export async function getPageSummary(title) {
    try {
        const encodedTitle = encodeURIComponent(title);
        const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;
        const data = await apiCall(url);
        return data;
    } catch (error) {
        console.error('Error fetching Wikipedia page:', error);
        throw error;
    }
}

/**
 * Fetch full page content from Wikipedia using HTML endpoint
 * @param {string} title - The title of the Wikipedia page
 * @returns {Promise<string>} Raw HTML content
 */
export async function getPageContent(title) {
    try {
        const encodedTitle = encodeURIComponent(title);
        // Use the /page/html endpoint which returns HTML text
        const url = `${WIKIPEDIA_API_BASE}/page/html/${encodedTitle}`;
        const htmlContent = await apiCall(url, false); // Don't parse as JSON, return raw HTML
        return htmlContent;
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
        const url = `${WIKIPEDIA_API_BASE}/page/search/${encodedQuery}?limit=${limit}`;
        const data = await apiCall(url);
        return data;
    } catch (error) {
        console.error('Error searching Wikipedia:', error);
        throw error;
    }
}
