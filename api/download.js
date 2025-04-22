export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const rapid = await fetch(`https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/convert?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com'
      },
    });

    const rapidData = await rapid.json();
    console.log('📦 RapidAPI response:', JSON.stringify(rapidData, null, 2));
    const mediaItems = rapidData?.media || [];

    const validated = await Promise.all(
      mediaItems.map(async (item) => {
        try {
          const head = await fetch(item.url, { method: 'HEAD' });
          const type = head.headers.get('content-type');
          if (!type || (!type.includes('image') && !type.includes('video'))) return null;

          return {
            url: item.url,
            media_type: type.includes('video') ? 'video' : 'image',
            thumbnail: item.thumbnail || (type.includes('image') ? item.url : null),
          };
        } catch {
          return null;
        }
      })
    );

    const filtered = validated.filter(Boolean);

    if (!filtered.length) {
      return res.status(404).json({ message: 'No valid media found' });
    }

    return res.status(200).json({ files: filtered });

  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message || err.toString()
    });
  }
}
