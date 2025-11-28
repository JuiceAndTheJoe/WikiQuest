// Parsing utilities for MediaWiki HTML -> plain text + structured sections
// This file centralizes DOM parsing logic so it can be unit-tested and
// reused by slices or other consumers.

// Convert raw HTML string to a cleaned plain-text article
export function stripHtml(html = '') {
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(String(html), 'text/html');

      // Prefer the article container when available
      const root = doc.querySelector('.mw-parser-output') || doc.body;

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
        // Non-fatal — continue
        // eslint-disable-next-line no-console
        console.warn('Error trimming trailing sections', err);
      }

      let text = root ? root.textContent || '' : '';

      // Remove bracketed refs and citation-needed markers
      text = text.replace(/\[\s*[a-z0-9]+\s*\]/gi, '');
      text = text.replace(/\[\s*citation needed\s*\]/gi, '');

      // Normalize whitespace
      text = text.replace(/\r\n|\r/g, '\n');
      text = text.replace(/\n{3,}/g, '\n\n');
      text = text.replace(/[ \t]+/g, ' ');
      text = text.replace(/\s+\n/g, '\n');

      // Cut off at trailing headings in the final text as a safety net
      try {
        const stopIndex = text.search(/(^|\n)\s*(References|See also|External links|Further reading|Notes|Bibliography)\b/i);
        if (stopIndex !== -1) text = text.slice(0, stopIndex);
      } catch (e) {
        // ignore
      }

      return String(text || '').trim();
    }
  } catch (e) {
    // fallback to simple tag stripping
    try {
      return String(html).replace(/<[^>]+>/g, '').trim();
    } catch (er) {
      return String(html || '').trim();
    }
  }
  return String(html || '').trim();
}

// Parse HTML into ordered sections [{ heading, text }]
export function htmlToSections(html = '') {
  try {
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(String(html), 'text/html');
      const root = doc.querySelector('.mw-parser-output') || doc.body;

      const sections = [];
      let current = { heading: 'Introduction', text: '' };

      // Use a TreeWalker to traverse elements in document order and reliably
      // pick up headings even when they're nested inside wrappers.
      const walker = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
      let node = walker.currentNode;
      // advance to first child element
      node = walker.nextNode();

      while (node) {
        const tag = node.tagName && node.tagName.toLowerCase();

        // Consider headings by tag or by .mw-headline spans
        if (/^h[1-6]$/.test(tag) || node.classList?.contains('mw-headline')) {
          // push previous section if it has text
          if ((current.text || '').trim()) sections.push(current);

          // Derive heading text: prefer .mw-headline content if present
          const headline = node.querySelector?.('.mw-headline')?.textContent || node.textContent || '';
          const headingText = String(headline).replace(/\[edit\]$/i, '').trim() || 'Untitled';
          current = { heading: headingText, text: '' };
        } else if (tag === 'p' || tag === 'ul' || tag === 'ol' || tag === 'div') {
          // clone to avoid mutating original and remove inline refs
          const clone = node.cloneNode(true);
          const refs = clone.querySelectorAll?.('sup.reference, .reference, .mw-cite-backlink') || [];
          refs.forEach((r) => r.remove());
          const txt = (clone.textContent || '').trim();
          if (txt) {
            if (current.text) current.text += '\n\n' + txt;
            else current.text = txt;
          }
        }

        node = walker.nextNode();
      }

      if ((current.text || '').trim()) sections.push(current);
      return sections.length ? sections : [{ heading: 'Content', text: stripHtml(html) }];
    }
  } catch (e) {
    return [{ heading: 'Content', text: stripHtml(html) }];
  }
}

// Simple text normalizer for UI
export function cleanText(str = '') {
  let t = String(str || '');
  t = t.replace(/\[\s*[a-z0-9]+\s*\]/gi, '');
  t = t.replace(/\[\s*citation needed\s*\]/gi, '');
  t = t.replace(/\r\n|\r/g, '\n');
  t = t.replace(/\n{3,}/g, '\n\n');
  t = t.replace(/[ \t]+/g, ' ');
  t = t.replace(/\s+\n/g, '\n');
  return t.trim();
}

export default {
  stripHtml,
  htmlToSections,
  cleanText,
};
