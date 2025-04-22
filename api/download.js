export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    // Always try RapidAPI first
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

    // If RapidAPI gave us valid media, return it — no need for Apify
    if (filtered.length) {
      return res.status(200).json({ files: filtered });
    }

    // Otherwise, fall back to Apify
    console.log('🌀 Falling back to Apify...');
    const apify = await fetch('https://api.apify.com/v2/actor-tasks/tmckee09~carousel-extractor-task/run-sync-get-dataset-items?token=apify_api_14X6dIzJvOtUWvWUivqwn9esXAeeQF1XtTGU', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startUrls: [url] }) // ✅ FIXED: pass array of strings
    });

    const apifyData = await apify.json();
    console.log('📦 Apify response:', JSON.stringify(apifyData, null, 2));
    const items = Array.isArray(apifyData) ? apifyData : apifyData.items || [];

    const results = items.map(item => ({
      url: item.downloadUrl,
      media_type: item.downloadUrl.includes('.mp4') ? 'video' : 'image',
      thumbnail: item.thumbnailUrl || item.downloadUrl,
    }));

    if (!results.length) {
      return res.status(404).json({ message: 'No files found via Apify', files: [], apifyData });
    }

    return res.status(200).json({ files: results });

  } catch (err) {
    console.error('❌ Download handler error:', err);
    return res.status(500).json({
      message: 'Something went wrong',
      error: err.message || err.toString()
    });
  }
}
