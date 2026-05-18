const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');
const { uploadBuffer } = require('../services/cloudinaryUpload');
const cloudinary = require('../config/cloudinary');

// GET /api/events/public
const getPublicEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: { $in: ['UPCOMING', 'ONGOING', 'COMPLETED'] } })
      .select('-gallery') // Exclude heavy gallery arrays for listing
      .sort({ startDate: -1 })
      .limit(20);
    res.json({ success: true, events });
  } catch (err) { next(err); }
};

// GET /api/events/:id/public
const getPublicEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, event });
  } catch (err) { next(err); }
};

// GET /api/events (Private)
const getEvents = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = { unitId: req.user.unit };
    
    if (status) query.status = status;
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ startDate: -1 });

    res.json({ success: true, events });
  } catch (err) { next(err); }
};

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body, unitId: req.user.unit, createdBy: req.user._id };

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'prahar/events');
      eventData.coverImage = { url: result.secure_url, publicId: result.public_id };
    }

    const event = await Event.create(eventData);

    await AuditLog.create({
      action: 'EVENT_CREATED',
      entityType: 'Event',
      entityId: event._id,
      performedBy: req.user._id,
      details: { title: event.title }
    });

    res.status(201).json({ success: true, event });
  } catch (err) { next(err); }
};

// PUT /api/events/:id
const updateEvent = async (req, res, next) => {
  try {
    const eventData = { ...req.body };

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'prahar/events');
      eventData.coverImage = { url: result.secure_url, publicId: result.public_id };
      // Note: Ideal implementation deletes old cover image from cloudinary here
    }

    const event = await Event.findByIdAndUpdate(req.params.id, eventData, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    
    res.json({ success: true, event });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Cleanup Cloudinary resources
    if (event.coverImage?.publicId) await cloudinary.uploader.destroy(event.coverImage.publicId).catch(()=>null);
    for (const photo of event.gallery || []) {
      if (photo.publicId) await cloudinary.uploader.destroy(photo.publicId).catch(()=>null);
    }

    await AuditLog.create({
      action: 'EVENT_DELETED',
      entityType: 'Event',
      entityId: req.params.id,
      performedBy: req.user._id,
      details: { title: event.title }
    });

    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
};

// POST /api/events/:id/gallery
const uploadGalleryPhotos = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No images uploaded.' });
    }

    const uploadPromises = req.files.map(file => uploadBuffer(file.buffer, 'prahar/gallery'));
    const results = await Promise.all(uploadPromises);

    const newPhotos = results.map(r => ({ url: r.secure_url, publicId: r.public_id }));
    event.gallery.push(...newPhotos);
    await event.save();

    res.json({ success: true, message: `${newPhotos.length} photos uploaded.`, gallery: event.gallery });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id/gallery/:photoId
const deleteGalleryPhoto = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    const photo = event.gallery.id(req.params.photoId);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found.' });

    if (photo.publicId) {
      await cloudinary.uploader.destroy(photo.publicId).catch(()=>null);
    }

    event.gallery.pull(req.params.photoId);
    await event.save();

    res.json({ success: true, message: 'Photo deleted.', gallery: event.gallery });
  } catch (err) { next(err); }
};

module.exports = { getPublicEvents, getPublicEventById, getEvents, createEvent, updateEvent, deleteEvent, uploadGalleryPhotos, deleteGalleryPhoto };
