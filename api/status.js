// Vercel serverless function - returns bot status
export default async function handler(req, res) {
  res.status(200).json({
    status: 'ready',
    message: 'Connect to Render/Railway/Fly.io for 24/7 bot'
  });
}
