/**
 * Wikipedia REST API Model
 * Centralizes all Wikipedia API interactions
 * Grade A requirement: Multi-source API integration
 */

import { apiCall } from "../api";
import { WIKIPEDIA_API_BASE } from "./constants";

/**
 * Fetch page summary from Wikipedia
 *
 * @param {string} title - The title of the Wikipedia page
 * @param {AbortSignal} signal - Optional AbortSignal to cancel the request
 * @returns {Promise<object>} - Wikipedia page summary data
 *
 * @see https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
 */
export async function getPageSummary(title, signal) {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;
    const data = await apiCall(url, true, signal);
    return data;
  } catch (error) {
    console.error("Error fetching Wikipedia page:", error);
    throw error;
  }
}
