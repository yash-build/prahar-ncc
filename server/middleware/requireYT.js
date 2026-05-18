// This middleware protects all /api/yt/* routes.
// Returns 404 (not 403) to make the route appear non-existent to anyone without the secret key.
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
