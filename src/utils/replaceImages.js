import { unsplashKey } from '../config/api';

const cache = new Map(); // keyword → unsplash URL (persists during session)

/**
 * Search Unsplash for a keyword and return a photo URL at the given dimensions.
 * Results are cached per keyword to avoid redundant API calls.
 */
const fetchUnsplashUrl = async (keyword, w, h) => {
  const cacheKey = keyword.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  try {
    const query = cacheKey.replace(/-/g, ' ').trim();
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${unsplashKey}`
    );
    if (!res.ok) return null;

    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;

    // Use Unsplash's dynamic resizing: raw URL + width/height params
    const url = `${photo.urls.raw}&w=${w}&h=${h}&fit=crop&auto=format&q=80`;
    cache.set(cacheKey, url);
    return url;
  } catch {
    return null;
  }
};

/**
 * Scan HTML for picsum.photos URLs, batch-fetch real Unsplash images, replace them.
 * Returns the updated HTML string.
 */
export const replaceImagesWithUnsplash = async (html) => {
  if (!unsplashKey || !html) return html;

  // Match all picsum URLs: https://picsum.photos/seed/{keyword}/{w}/{h}
  const picsumRegex = /https:\/\/picsum\.photos\/seed\/([\w-]+)\/(\d+)\/(\d+)/g;
  const matches = [];
  let match;

  while ((match = picsumRegex.exec(html)) !== null) {
    matches.push({ full: match[0], keyword: match[1], w: match[2], h: match[3] });
  }

  if (matches.length === 0) return html;

  // Deduplicate by keyword to minimize API calls
  const uniqueKeywords = [...new Map(matches.map(m => [m.keyword, m])).values()];

  // Fetch all unique images in parallel (max 10 concurrent to respect rate limits)
  const batchSize = 10;
  const replacements = new Map();

  for (let i = 0; i < uniqueKeywords.length; i += batchSize) {
    const batch = uniqueKeywords.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async ({ keyword, w, h }) => {
        const url = await fetchUnsplashUrl(keyword, w, h);
        return { keyword, url };
      })
    );
    results.forEach(({ keyword, url }) => {
      if (url) replacements.set(keyword, url);
    });
  }

  // Replace all picsum URLs with real Unsplash URLs
  let updated = html;
  for (const { full, keyword } of matches) {
    const realUrl = replacements.get(keyword);
    if (realUrl) {
      updated = updated.split(full).join(realUrl);
    }
  }

  return updated;
};

/**
 * Process all generated files — replace picsum images with real Unsplash photos.
 * Returns updated files object.
 */
export const replaceImagesInFiles = async (files) => {
  if (!unsplashKey || !files || Object.keys(files).length === 0) return files;

  const entries = Object.entries(files);
  const updated = {};

  // Process all files in parallel
  const results = await Promise.all(
    entries.map(async ([name, html]) => {
      const newHtml = await replaceImagesWithUnsplash(html);
      return [name, newHtml];
    })
  );

  results.forEach(([name, html]) => { updated[name] = html; });
  return updated;
};
