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
    'X-RapidAPI-Key': 'YOUR-KEY-HERE',
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

 try {
  const rapid = await fetchWithRetry(`${RAPIDAPI_URL}?url=${encodeURIComponent(url)}`, {
    method: 'GET',
    headers: RAPIDAPI_HEADERS,
  });

  const rapidData = await rapid.json();
  console.log('📦 RapidAPI response:', JSON.stringify(rapidData, null, 2));

  const mediaItems = Array.isArray(rapidData?.media) ? rapidData.media : [];

  if (!mediaItems.length) {
    return res.status(404).json({ message: 'No valid media found' });
  }

  const files = mediaItems.map(item => ({
    url: item.url,
    thumbnail: item.thumbnail || null,
    media_type: item.url.includes('.mp4') ? 'video' : 'image',  // crude detection, fine for now
  }));

  console.log('🛑 Final Response about to send to frontend:', JSON.stringify({ files }, null, 2)); // 🔥 move log here

  return res.status(200).json({ files });

} catch (err) {
  console.error('❌ Download handler error:', err);
  return res.status(500).json({
    message: 'Something went wrong',
    error: err.message || err.toString()
  });
}
}
