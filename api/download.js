export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();

    // Match Open Graph video and image
    const ogVideoMatch = html.match(/<meta property="og:video" content="(.*?)"/);
    const ogImageMatch = html.match(/<meta property="og:image" content="(.*?)"/);

    const videoUrl = ogVideoMatch ? ogVideoMatch[1] : null;
    const thumbnail = ogImageMatch ? ogImageMatch[1] : null;

    if (!videoUrl && !thumbnail) {
      return res.status(404).json({
        error: true,
        message: 'No media found at this URL',
        thumbnail: null,
        download_url: null
      });
    }

    res.status(200).json({
      thumbnail,
      download_url: videoUrl || thumbnail
    });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ message: 'Failed to fetch Instagram post' });
  }
}
