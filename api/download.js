export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch('https://igram.io/i/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }),
    });

    const html = await response.text();

    // Try to find video or image URL from the HTML (fallback basic match)
    const videoMatch = html.match(/href="(https:\/\/[^"]+\.mp4)"/);
    const imageMatch = html.match(/href="(https:\/\/[^"]+\.jpg)"/);

    const downloadUrl = videoMatch?.[1] || imageMatch?.[1];
    if (!downloadUrl) {
      return res.status(404).json({
        error: true,
        message: 'No downloadable media found',
        thumbnail: null,
        download_url: null
      });
    }

    res.status(200).json({
      thumbnail: null, // could improve this later
      download_url: downloadUrl,
    });
  } catch (err) {
    console.error('Backup IG fetch failed:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}

