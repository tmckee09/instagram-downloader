export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  const RAPIDAPI_URL = 'https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert';
  const RAPIDAPI_HEADERS = {
    'X-RapidAPI-Key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
    'X-RapidAPI-Host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com',
  };

  async function fetchWithRetry(url, options, retries = 2) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return response;
    } catch (error) {
      if (retries > 0) {
        console.warn(`⚠️ RapidAPI request failed. Retrying... (${retries} left)`);
        return await fetchWithRetry(url, options, retries - 1);
      } else {
        throw error;
      }
    }
  }

  try {
    const rapid = await fetchWithRetry(`${RAPIDAPI_URL}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: RAPIDAPI_HEADERS,
    });

    const rapidData = await rapid.json();
    console.log('📦 RapidAPI response:', JSON.stringify(rapidData, null, 2));

    let mediaItems = [];

    // ⚡ Detect different structures returned
    if (Array.isArray(rapidData?.media)) {
      mediaItems = rapidData.media;
    } else if (rapidData?.url) {
      mediaItems = [{
        url: rapidData.url,
        thumbnail: rapidData.thumbnail || null,
      }];
    } else if (rapidData?.download_url) {
      mediaItems = [{
        url: rapidData.download_url,
        thumbnail: rapidData.thumbnail || null,
      }];
    }

    if (!mediaItems.length) {
      return res.status(404).json({ message: 'No valid media found' });
    }

    // ✅ SKIP validation (accept all) because story links don't have proper headers
    const validated = mediaItems.map(item => ({
      url: item.url,
      media_type: 'unknown',
      thumbnail: item.thumbnail || null,
    }));

    return res.status(200).json({ files: validated });

  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message || err.toString(),
    });
  }
}
