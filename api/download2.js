// api/download2.js  – TikTok downloader proxy for RapidAPI (with debug)

// ---------------------------------------------------
// HOW TO REMOVE DEBUG LATER
//   1. Delete the console.log lines once everything works.
//   2. Keep only the mapping you need for download_url.
// ---------------------------------------------------

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
        'x-rapidapi-key': process.env.RAPID_TT_KEY,
        'x-rapidapi-host': 'tiktok-video-downloader-api.p.rapidapi.com',
      },
    });

    // ─── Debug logs ─────────────────────────────────────────────
    console.log('ENV KEY present?', !!process.env.RAPID_TT_KEY);
    console.log('RapidAPI status', response.status);
    // ────────────────────────────────────────────────────────────

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidAPI error text', errorText);
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();

    // More debug: view first part of payload (avoid huge logs)
    console.log('RapidAPI payload', JSON.stringify(data).slice(0, 400));

    // Map the actual downloadable URL — adjust keys based on real response
    const downloadUrl =
      data?.result?.nowatermark || // many providers use this
      data?.video ||               // fallback 1
      data?.url   ||               // fallback 2
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
