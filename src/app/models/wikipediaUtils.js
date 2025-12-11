/**
 * Convert image URL to Base64 data URL to prevent URL inspection
 *
 * @param {string} imageUrl - The URL of the image to convert
 * @returns {Promise<string>} - Base64 data URL
 */
export async function convertImageToBase64(imageUrl) {
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
    console.error("Error converting image to Base64:", error);
    return null;
  }
}

/**
 * Parse and convert date templates to readable format
 * Handles {{birth date|YYYY|M|D}}, {{death date|...}}, {{start date|...}}, etc.
 *
 * @param {string} input - The input string
 * @returns {string} - String with date templates converted to readable dates
 */
function parseDateTemplates(input) {
  const dateTemplateRegex =
    /\{\{(birth date|death date|start date|end date|date)[^}]*\|(\d{4})\|(\d{1,2})\|(\d{1,2})[^}]*\}\}/gi;

  return input.replace(dateTemplateRegex, (_, __, year, month, day) => {
    const formattedDate = `${year}/${parseInt(month, 10)}/${parseInt(day, 10)}`;
    return formattedDate;
  });
}

/**
 * Remove all '{{...}}' templates from input string, handling nested templates
 * @param {string} input - The input string
 * @returns {string} - The cleaned string
 */
function removeTemplates(input) {
  let out = "";
  let depth = 0;

  for (let i = 0; i < input.length; i++) {
    if (input.startsWith("{{", i)) {
      depth++;
      i++;
      continue;
    }
    if (input.startsWith("}}", i)) {
      depth--;
      i++;
      continue;
    }
    if (depth === 0) out += input[i];
  }

  return out;
}

/**
 * Remove <ref>...</ref> and self-closing <ref .../> tags from input
 *
 * @param {string} input - The input string
 * @returns {string} - The cleaned string
 */
function removeRefs(input) {
  input = input.replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "");
  return input.replace(/<ref[^>]*\/>/gi, "");
}

/**
 * Remove HTML tags from input string
 * @param {string} input - The input string
 * @returns {string} - The cleaned string
 */
function removeHtmlTags(input) {
  return input.replace(/<[^>]+>/g, "");
}

/**
 * Decode HTML entities in input string
 * @param {string} input - The input string
 * @returns {string} - The decoded string
 */
function decodeEntities(input) {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

/**
 * Clean Wikipedia wikitext to extract plain summary
 * @param {string} wikiText - The raw wikitext from Wikipedia
 * @returns {string} - The cleaned plain text summary
 */
export function cleanWikitext(wikiText) {
  const text = wikiText;

  const parts = text.split("\n\n");
  let newText = parts.slice(1, 4).join("\n\n");

  newText = parseDateTemplates(newText);
  newText = removeTemplates(newText);
  newText = removeRefs(newText);
  newText = removeHtmlTags(newText);

  // Remove bold/italic markup: **text**, ''text''
  newText = newText.replace(/'{2,}/g, "");

  // Remove headings like == Heading ==
  newText = newText.replace(/==+[^=]+==+/g, "");

  // Handle links: [[Page|Display Text]] or [[Page]]
  newText = newText
    .replace(/\[\[[^|\]]*\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1");

  newText = decodeEntities(newText);

  // Remove trailing semicolons after opening parentheses, common case: (; born 1900)
  newText = newText.replace(/\(\s*;/g, "(");

  return newText.trim();
}
