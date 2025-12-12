/**
 * Wikipedia REST API Model
 * Centralizes all Wikipedia API interactions
 * Grade A requirement: Multi-source API integration
 */

import { apiCall } from "../api";
import { DETAILED_WIKIPEDIA_API_BASE, WIKIPEDIA_API_BASE } from "./constants";
import { cleanWikitext, convertImageToBase64 } from "./wikipediaUtils";

/**
 * Fetch page summary from Wikipedia
 *
 * @param {string} title - The title of the Wikipedia page
 * @param {AbortSignal} signal - Optional AbortSignal to cancel the request
 * @returns {Promise<object>} - Wikipedia page summary data with Base64 image
 *
 * @see https://en.wikipedia.org/api/rest_v1/#/Page%20content/get_page_summary__title_
 */
export async function getPageSummary(title, signal) {
  try {
    const encodedTitle = encodeURIComponent(title);

    const detailed_url = `${DETAILED_WIKIPEDIA_API_BASE}/page/${encodedTitle}`;
    const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;

    const detailedData = await apiCall(detailed_url, true, signal);
    const data = await apiCall(url, true, signal);

    // Convert thumbnail to Base64 to prevent URL inspection cheating
    if (data.thumbnail?.source) {
      const base64Image = await convertImageToBase64(data.thumbnail.source);
      if (base64Image) {
        data.thumbnail.source = base64Image;
      }
    }

    data.fullContent = cleanWikitext(detailedData.source);

    return data;
  } catch (error) {
    console.error("Error fetching Wikipedia page:", error);
    throw error;
  }
}
