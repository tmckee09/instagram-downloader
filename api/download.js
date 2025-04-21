export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch('https://saveig.app/api/ajaxSearch/index', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: new URLSearchParams({ q: url }),
    });

    const data = await response.json();

    if (!data || !data.data || !data.data.length) {
      return res.status(404).json({
        error: true,
        message: 'No downloadable media found',
        thumbnail: null,
        download_url: null
      });
    }

    const file = data.data[0]; // First file (usually the main video/image)
    return res.status(200).json({
      thumbnail: file.thumb || null,
      download_url: file.url || null,
    });
  } catch (err) {
    console.error('Parser API error:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}
