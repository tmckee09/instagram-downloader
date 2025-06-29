// api/download2.js – TikTok downloader proxy for RapidAPI

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url || !url.includes('tiktok.com')) {
    return res.status(400).json({ message: 'Invalid TikTok URL' });
  }

  try {
    const apiURL = `https://tiktok-download-without-watermark.p.rapidapi.com/analysis?url=${encodeURIComponent(url)}&hd=0`;

    const response = await fetch(apiURL, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
        'x-rapidapi-host': 'tiktok-download-without-watermark.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      download_url: data?.video?.no_watermark || '',
      full_response: data,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || 'Failed to fetch from TikTok API',
    });
  }
}
