/**
 * Generic API call helper
 *
 * @param {string} url - Full URL to fetch
 * @param {boolean} expectJson - Whether to parse response as JSON (default true)
 * @param {AbortSignal} signal - Optional AbortSignal to cancel the request
 * @returns {Promise<Object|string>} Response data
 */
export async function apiCall(url, expectJson = true, signal) {
  const response = await fetch(url, signal ? { signal } : undefined);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (expectJson) {
    const result = await response.json();
    return result;
  }

  const result = await response.text();
  return result;
}
