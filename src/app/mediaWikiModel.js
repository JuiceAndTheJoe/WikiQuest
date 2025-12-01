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
async function apiCall(url, expectJson = true, signal) {
    const response = await fetch(url, signal ? { signal } : undefined);
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
export async function getPageSummary(title, signal) {
    try {
        const encodedTitle = encodeURIComponent(title);
        const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;
        const data = await apiCall(url, true, signal);
        return data;
    } catch (error) {
        console.error('Error fetching Wikipedia page:', error);
        throw error;
    }
}

