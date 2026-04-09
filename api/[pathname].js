import { get } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { pathname } = req.query;

  try {
    const blob = await get(pathname);

    res.setHeader('Content-Type', blob.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.send(blob.body);
  } catch (error) {
    return res.status(404).json({ error: 'Image not found' });
  }
}
