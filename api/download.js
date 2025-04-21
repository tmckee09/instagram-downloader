export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const html = await response.text();

    const videoMatch = html.match(/"video_url":"(.*?)"/);
    const imageMatch = html.match(/"display_url":"(.*?)"/);

    const videoUrl = videoMatch ? decodeURIComponent(videoMatch[1]) : null;
    const thumbnail = imageMatch ? decodeURIComponent(imageMatch[1]) : null;

    if (!videoUrl && !thumbnail) {
      return res.status(404).json({ message: 'No media found at this URL' });
    }

    res.status(200).json({
      thumbnail,
      download_url: videoUrl || thumbnail
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch Instagram post' });
  }
}
