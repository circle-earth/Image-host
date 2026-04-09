export const config = {
  api: {
    bodyParser: false,
    responseLimit: '8mb',
  },
};

export default async function handler(req, res) {
  // Enable CORS
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

    // Validate image
    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 8MB'
      });
    }

    // Get filename from header or generate one
    const filename = req.headers['x-filename'] || `img-${Date.now()}.jpg`;
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Return image as base64 (for demo purposes without Vercel Blob)
    const base64 = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    // Generate a unique ID for this upload
    const uploadId = Math.random().toString(36).substring(2, 15);

    return res.status(200).json({
      success: true,
      url: `/api/image/${uploadId}`,
      downloadUrl: dataUrl,
      id: uploadId,
      filename: safeFilename,
      size: buffer.length,
      // Store in memory (temporary - for demo only)
      // For production, use Vercel Blob or external storage
      message: 'Image uploaded! Note: This is a demo - images are not persisted without storage.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: 'Upload failed',
      message: error.message || 'Unknown error'
    });
  }
}
