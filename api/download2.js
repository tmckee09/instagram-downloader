// api/download2.js  – TikTok downloader proxy for RapidAPI (hard‑coded key)
// NOTE: Embedding keys in code is not recommended for production.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url || !url.includes('tiktok.com')) {
    return res.status(400).json({ message: 'Invalid TikTok URL' });
  }

  try {
    const apiURL =
      `https://tiktok-video-downloader-api.p.rapidapi.com/download/nowatermark?url=` +
      encodeURIComponent(url);

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa', // ← updated key
        'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
      },
    });

    // ─── Debug logs ─────────────────────────────────────────────
    console.log('RapidAPI status', response.status);
    // ────────────────────────────────────────────────────────────

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error text', errorText);
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();
    console.log('RapidAPI payload', JSON.stringify(data).slice(0, 400));

    const downloadUrl =
      data?.result?.nowatermark ||
      data?.video ||
      data?.url ||
      '';

    return res.status(200).json({
      success: !!downloadUrl,
      download_url: downloadUrl,
      full_response: data,
    });
  } catch (err) {
    console.error('download2.js error', err);
    return res.status(500).json({
      message: err.message || 'Failed to fetch from TikTok API',
    });
  }
}
