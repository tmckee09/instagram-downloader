const RAPIDAPI_URL =
  'https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert';
const RAPIDAPI_HEADERS = {
  'X-RapidAPI-Key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
  'X-RapidAPI-Host':
    'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com',
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800; // basic exponential‑backoff seed

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } catch (err) {
    if (retries === 0) throw err;
    await sleep(RETRY_DELAY_MS * (MAX_RETRIES - retries + 1));
    return fetchWithRetry(url, options, retries - 1);
  }
}

function isValidInstagramUrl(raw) {
  try {
    const u = new URL(raw);
    return /(?:^|\.)instagram\.com$/.test(u.hostname);
  } catch {
    return false;
  }
}

function flattenMedia(mediaArray = []) {
  return mediaArray.flatMap((item) => {
    const collected = [];
    if (item.url) {
      collected.push({
        url: item.url,
        thumbnail: item.thumbnail ?? null,
        media_type: item.url.endsWith('.mp4') ? 'video' : 'image',
      });
    }
    if (Array.isArray(item.children)) {
      collected.push(...flattenMedia(item.children));
    }
    return collected;
  });
}

function normalizeMediaItems(data) {
  if (Array.isArray(data?.media)) return flattenMedia(data.media);

  if (data?.url) {
    return [
      {
        url: data.url,
        thumbnail: data.thumbnail ?? null,
        media_type: data.url.endsWith('.mp4') ? 'video' : 'image',
      },
    ];
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res
      .setHeader('Allow', 'POST')
      .status(405)
      .json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body ?? {};

  if (!url || !isValidInstagramUrl(url)) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const apiRes = await fetchWithRetry(
      `${RAPIDAPI_URL}?url=${encodeURIComponent(url)}`,
      {
        method: 'GET',
        headers: RAPIDAPI_HEADERS,
      }
    );

    const apiData = await apiRes.json();
    const files = normalizeMediaItems(apiData);

    if (!files.length) {
      return res.status(404).json({ message: 'No valid media found' });
    }

    return res.status(200).json({ files });
  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message ?? String(err),
    });
  }
}
