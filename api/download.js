export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  // 🛡 Fast Private Account Detector (NEW)
  try {
    const testFetch = await fetch(url, { method: 'HEAD' });
    const contentType = testFetch.headers.get('content-type') || '';

    if (contentType.includes('text/html')) {
      return res.status(403).json({ message: 'This Instagram post is private, restricted, or unavailable.' });
    }
  } catch (err) {
    console.warn('⚠️ Private/Dead post detection triggered:', err.message || err.toString());
    return res.status(403).json({ message: 'This Instagram post is private, restricted, or unavailable.' });
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

    const mediaItems = rapidData?.media || [];

    async function validateUrl(item) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const head = await fetch(item.url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);

        const type = head.headers.get('content-type');
        if (!type || (!type.includes('image') && !type.includes('video'))) return null;

        return {
          url: item.url,
          media_type: type.includes('video') ? 'video' : 'image',
          thumbnail: item.thumbnail || (type.includes('image') ? item.url : null),
        };
      } catch (error) {
        console.warn('⚠️ Media validation failed:', item.url);
        return null;
      }
    }

    const validated = await Promise.all(mediaItems.map(validateUrl));
    const filtered = validated.filter(Boolean);

    if (!filtered.length) {
      return res.status(404).json({ message: 'No valid media found' });
    }

    return res.status(200).json({ files: filtered });

  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message || err.toString()
    });
  }
}
