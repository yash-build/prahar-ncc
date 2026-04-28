// This middleware protects all /api/yt/* routes
// This middleware protects all /api/yt/* routes
// Only Yash Tiwari can access these — verified by secret key in header
const requireYT = (req, res, next) => {
  const secret = req.headers['x-yt-secret'];

  if (!secret || secret !== process.env.YT_GOD_SECRET) {
    // Return a 404 to make it look like route doesn't exist
    // This prevents anyone from even knowing the route exists
    return res.status(404).json({
      success: false,
      message: 'Route not found.'
    });
  }
  next();
};

module.exports = requireYT;
