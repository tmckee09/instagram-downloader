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

    // ✅ Validate main download URL
    const headRes = await fetch(file.url, { method: 'HEAD' });
    const type = headRes.headers.get('content-type');
    if (!type || (!type.includes('image') && !type.includes('video'))) {
      return res.status(415).json({
        error: true,
        message: 'Download URL is not a valid media file',
        thumbnail: null,
        download_url: null
      });
    }

    // ✅ Validate thumbnail (if present)
    let thumbnail = null;
    if (file.thumbnail) {
      try {
        const thumbRes = await fetch(file.thumbnail, { method: 'HEAD' });
        const thumbType = thumbRes.headers.get('content-type');
        if (thumbType && thumbType.includes('image')) {
          thumbnail = file.thumbnail;
        }
      } catch (err) {
        console.warn('Thumbnail validation failed:', err);
      }
    }

    return res.status(200).json({
      thumbnail,
      download_url: file.url
    });
  } catch (err) {
    console.error('RapidAPI error:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}

