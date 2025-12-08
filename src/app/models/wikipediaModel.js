/**
 * Wikipedia REST API Model
 * Centralizes all Wikipedia API interactions
 * Grade A requirement: Multi-source API integration
 */

import { apiCall } from "../api";
import { WIKIPEDIA_API_BASE } from "./constants";

/**
 * Convert image URL to Base64 data URL to prevent URL inspection
 *
 * @param {string} imageUrl - The URL of the image to convert
 * @returns {Promise<string>} - Base64 data URL
 */
async function convertImageToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return null;
  }
}

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
    const url = `${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`;
    const data = await apiCall(url, true, signal);
    
    // Convert thumbnail to Base64 to prevent URL inspection cheating
    if (data.thumbnail && data.thumbnail.source) {
      const base64Image = await convertImageToBase64(data.thumbnail.source);
      if (base64Image) {
        data.thumbnail.source = base64Image;
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching Wikipedia page:", error);
    throw error;
  }
}
