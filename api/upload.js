export const config = {
  api: {
    bodyParser: false,
    responseLimit: '10mb',
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'File too large (max 10MB)' });
    }

    // Convert buffer to base64
    const base64Image = buffer.toString('base64');

    // Upload to ImgBB API
    const params = new URLSearchParams();
    params.append('image', base64Image);
    params.append('type', 'base64');

    const response = await fetch('https://api.imgbb.com/1/upload?key=97f738e5e871f82e42b03a96064aa935', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    const data = await response.json();

    if (response.status !== 200 || !data.success) {
      console.error('ImgBB error:', data);
      throw new Error(data.error?.message || `HTTP ${response.status}`);
    }

    return res.status(200).json({
      success: true,
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      filename: data.data.title,
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
