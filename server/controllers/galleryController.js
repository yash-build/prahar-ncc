const GalleryItem = require('../models/GalleryItem');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../config/cloudinary');

// GET /api/gallery
const getGallery = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;
    const query = { unitId: req.user.unit };

    if (category && category !== 'ALL') query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await GalleryItem.countDocuments(query);
    const items = await GalleryItem.find(query)
      .populate('uploadedBy', 'name role')
      .sort({ takenAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// POST /api/gallery
const createGalleryItem = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required.' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'prahar/gallery', transformation: [{ width: 1200, crop: 'limit' }] },
        (err, result) => err ? reject(err) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    const imageUrl = result.secure_url;
    const thumbUrl = result.secure_url.replace('/upload/', '/upload/w_300,h_300,c_fill/');
    const publicId = result.public_id;

    const item = await GalleryItem.create({
      ...req.body,
      unitId: req.user.unit,
      uploadedBy: req.user._id,
      imageUrl,
      thumbUrl,
      publicId
    });

    await AuditLog.create({
      action: 'GALLERY_ADDED',
      entityType: 'GalleryItem',
      entityId: item._id,
      performedBy: req.user._id,
      details: { title: item.title }
    });

    res.status(201).json({ success: true, item });
  } catch (err) { next(err); }
};

// PUT /api/gallery/:id
const updateGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });
    res.json({ success: true, item });
  } catch (err) { next(err); }
};

// DELETE /api/gallery/:id
const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Gallery item not found.' });

    if (item.publicId) {
      await cloudinary.uploader.destroy(item.publicId);
    }

    await item.deleteOne();

    await AuditLog.create({
      action: 'GALLERY_DELETED',
      entityType: 'GalleryItem',
      entityId: req.params.id,
      performedBy: req.user._id,
      details: { title: item.title }
    });

    res.json({ success: true, message: 'Gallery item deleted.' });
  } catch (err) { next(err); }
};

// GET /api/gallery/public
const getPublicGallery = async (req, res, next) => {
  try {
    const items = await GalleryItem.find({ showOnPublic: true })
      .sort({ takenAt: -1, createdAt: -1 })
      .limit(50);
    res.json({ success: true, items });
  } catch (err) { next(err); }
};

module.exports = { getGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, getPublicGallery };
