// Temporary in-memory storage (for demo purposes)
// In production, replace with Vercel Blob or external storage

const imageStore = new Map();

// Expose store globally for upload.js to use
globalThis.imageStore = globalThis.imageStore || imageStore;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  const { id } = req.query;

  if (req.method === 'GET') {
    const imageData = globalThis.imageStore.get(id);

    if (!imageData) {
      return res.status(404).json({
        error: 'Image not found',
        message: 'This image was not uploaded or has expired'
      });
    }

    res.setHeader('Content-Type', imageData.contentType || 'image/jpeg');
    return res.send(imageData.buffer);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
