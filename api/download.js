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
        return await fetchWithRetry(url, options, retries - 1);
      } else {
        throw error;
      }
    }
  }

  function normalizeMediaItems(data) {
    const items = [];

    if (Array.isArray(data?.media)) {
      for (const item of data.media) {
        if (item.url) {
          items.push({
            url: item.url,
            thumbnail: item.thumbnail || null,
            media_type: item.url.includes('.mp4') ? 'video' : 'image',
          });
        }

        // Handle nested children array (carousel posts)
        if (Array.isArray(item.children)) {
          for (const child of item.children) {
            if (child.url) {
              items.push({
                url: child.url,
                thumbnail: child.thumbnail || null,
                media_type: child.url.includes('.mp4') ? 'video' : 'image',
              });
            }
          }
        }
      }
    } else if (data?.url) {
      items.push({
        url: data.url,
        thumbnail: data.thumbnail || null,
        media_type: data.url.includes('.mp4') ? 'video' : 'image',
      });
    }

    return items;
  }

  try {
    const rapid = await fetchWithRetry(`${RAPIDAPI_URL}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: RAPIDAPI_HEADERS,
    });

    const rapidData = await rapid.json();
    console.log('📦 RapidAPI response:', JSON.stringify(rapidData, null, 2));

    const files = normalizeMediaItems(rapidData);

    if (!files.length) {
      return res.status(404).json({ message: 'No valid media found' });
    }

    console.log('🛑 Final Response to frontend:', JSON.stringify({ files }, null, 2));
    return res.status(200).json({ files });

  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message || err.toString()
    });
  }
}
