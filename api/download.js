export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    // Primary API (RapidAPI)
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

    const validatedRapid = await Promise.all(
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
        } catch (e) {
          console.warn('⚠️ Failed to validate media item:', e);
          return null;
        }
      })
    );

    const filteredRapid = validatedRapid.filter(Boolean);
    const allImages = filteredRapid.every(item => item.media_type === 'image');
    const isLikelyCarousel = filteredRapid.length > 1;

    if (allImages && isLikelyCarousel) {
      console.log('🌀 Fallback to Apify for carousel videos...');
      const apify = await fetch('https://api.apify.com/v2/actor-tasks/epctex~instagram-video-downloader/run-sync-get-dataset-items?token=apify_api_14X6dIzJvOtUWvWUivqwn9esXAeeQF1XtTGU', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startUrls: [{ url }] })
      });

      const apifyData = await apify.json();
      console.log('📦 Apify response:', JSON.stringify(apifyData, null, 2));

      const results = (apifyData || []).map(item => ({
        url: item.downloadUrl,
        media_type: item.downloadUrl.includes('.mp4') ? 'video' : 'image',
        thumbnail: item.thumbnailUrl || item.downloadUrl,
      }));

      if (!results.length) {
        return res.status(404).json({ message: 'No files found via Apify', files: [] });
      }

      return res.status(200).json({ files: results });
    }

    if (filteredRapid.length) {
      return res.status(200).json({ files: filteredRapid });
    }

    return res.status(404).json({ message: 'No media found', files: [] });

  } catch (err) {
    console.error('Download handler error:', err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
