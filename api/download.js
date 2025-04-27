export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

    // 🔥 Updated Validator: fallback if HEAD fails
    async function validateUrl(item) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const head = await fetch(item.url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timeout);

        const type = head.headers.get('content-type');
        if (!type || (!type.includes('image') && !type.includes('video'))) {
          // 🛡 fallback: still accept URL if type unknown
          return {
            url: item.url,
            media_type: 'unknown',
            thumbnail: item.thumbnail || null,
          };
        }

        return {
          url: item.url,
          media_type: type.includes('video') ? 'video' : 'image',
          thumbnail: item.thumbnail || (type.includes('image') ? item.url : null),
        };
      } catch (error) {
        console.warn('⚠️ Media validation failed:', item.url, error.message || error.toString());

        // 🛡 fallback: still accept URL if HEAD fails
        return {
          url: item.url,
          media_type: 'unknown',
          thumbnail: item.thumbnail || null,
        };
      }
    }

    const validated = await Promise.all(mediaItems.map(validateUrl));
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
