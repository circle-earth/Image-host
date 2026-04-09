export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 8MB)' });
    }

    // Convert to base64 for ImgBB API
    const base64Image = buffer.toString('base64');

    // Upload to ImgBB (free, no API key required for basic upload)
    const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        key: '97f738e5e871f82e42b03a96064aa935',
        image: base64Image,
      }),
    });

    const imgbbData = await imgbbResponse.json();

    if (!imgbbData.success) {
      throw new Error(imgbbData.error?.message || 'ImgBB upload failed');
    }

    return res.status(200).json({
      success: true,
      url: imgbbData.data.url,
      deleteUrl: imgbbData.data.delete_url,
      filename: imgbbData.data.title,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Unknown error',
    });
  }
}
