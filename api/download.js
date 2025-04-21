export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ message: 'Invalid Instagram URL' });
  }

  try {
    const response = await fetch(`https://instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com/index?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'b31dd2def0mshb0dafdf5939b1acp10ea7djsnc407d4d845fa',
        'X-RapidAPI-Host': 'instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com'
      },
    });

    const data = await response.json();
    console.log("RapidAPI raw response:", data);

    const media = data?.media || {};
    const downloadUrl = media?.url || null;
    const thumbnail = media?.thumbnail || null;

    if (!downloadUrl) {
      return res.status(404).json({
        error: true,
        message: 'No downloadable media found',
        thumbnail: null,
        download_url: null
      });
    }

    return res.status(200).json({
      thumbnail,
      download_url: downloadUrl
    });
  } catch (err) {
    console.error('RapidAPI error:', err);
    res.status(500).json({ message: 'Failed to fetch download data' });
  }
}
