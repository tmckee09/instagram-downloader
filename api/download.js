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
    const mediaItems = data?.media || [];

    if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'No downloadable media found',
        files: []
      });
    }

    const validatedFiles = await Promise.all(
      mediaItems.map(async (item) => {
        try {
          const headRes = await fetch(item.url, { method: 'HEAD' });
          const contentType = headRes.headers.get('content-type');
          if (!contentType || (!contentType.includes('image') && !contentType.includes('video'))) {
            return null;
          }

          const mediaType = contentType.includes('video') ? 'video' : 'image';
          let thumbnail = null;

          if (mediaType === 'image') {
            thumbnail = item.url;
          } else if (item.thumbnail) {
            try {
              const thumbRes = await fetch(item.thumbnail, { method: 'HEAD' });
              const thumbType = thumbRes.headers.get('content-type');
              if (thumbType && thumbType.includes('image')) {
                thumbnail = item.thumbnail;
              }
            } catch (err) {
              console.warn('Thumbnail validation failed:', err);
            }
          }

          return {
            url: item.url,
            media_type: mediaType,
            thumbnail
          };
        } catch (e) {
          console.warn('Failed to validate media item:', e);
          return null;
        }
      })
    );

    const filtered = validatedFiles.filter(Boolean);

    if (filtered.length === 0) {
      return res.status(415).json({
        error: true,
        message: 'No valid media files',
        files: []
      });
    }

    return res.status(200).json({
      files: filtered
    });

  } catch (err) {
    console.error('RapidAPI error:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}
