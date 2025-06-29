// api/download2.js  – TikTok downloader proxy for RapidAPI

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url || !url.includes('tiktok.com')) {
    return res.status(400).json({ message: 'Invalid TikTok URL' });
  }

  try {
    const apiURL = `https://tiktok-video-downloader-api.p.rapidapi.com/download/nowatermark?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': process.env.RAPID_TT_KEY,
        'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      download_url: data?.video || data?.url || '',
      full_response: data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || 'Failed to fetch from TikTok API',
    });
  }
}
