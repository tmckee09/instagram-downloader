export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch(`https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com'
      },
    });

    const data = await response.json();
    const file = data?.media?.[0];

    if (!file?.url) {
      return res.status(404).json({
        error: true,
        message: 'No downloadable media found',
        thumbnail: null,
        download_url: null
      });
    }

    // Validate MIME type (make sure it's an image or video)
    const headResponse = await fetch(file.url, { method: 'HEAD' });
    const contentType = headResponse.headers.get('content-type');

    if (!contentType || (!contentType.includes('image') && !contentType.includes('video'))) {
      return res.status(415).json({
        error: true,
        message: 'File is not a valid media type',
        content_type: contentType,
        thumbnail: null,
        download_url: null
      });
    }

    return res.status(200).json({
      thumbnail: file.thumbnail || null,
      download_url: file.url
    });
  } catch (err) {
    console.error('RapidAPI error:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}
