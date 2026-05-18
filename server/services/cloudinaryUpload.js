const cloudinary = require('../config/cloudinary');

/**
 * Uploads a file buffer to Cloudinary using upload_stream
 * @param {Buffer} buffer - The file buffer from Multer memory storage
 * @param {String} folder - Cloudinary folder name (e.g., 'prahar/gallery')
 * @param {String} resourceType - 'image', 'video', 'raw', or 'auto'
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, folder = 'prahar/general', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'your_api_key') {
      console.warn('⚠️ [DEV WARNING] Cloudinary API Key missing. Returning Base64 Data URI.');
      const isPdf = resourceType === 'raw' || (buffer && buffer.toString('hex', 0, 4) === '25504446');
      
      let secure_url;
      if (isPdf) {
        secure_url = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      } else {
        // Convert buffer to base64 so the actual image is displayed
        const base64Str = buffer.toString('base64');
        secure_url = `data:image/jpeg;base64,${base64Str}`;
      }
      
      return resolve({
        secure_url,
        public_id: `mock_${Date.now()}`,
        resource_type: isPdf ? 'raw' : 'image'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // End the stream with the buffer
    uploadStream.end(buffer);
  });
};

module.exports = { uploadBuffer };
