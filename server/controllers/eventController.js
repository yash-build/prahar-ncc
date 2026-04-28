const Event = require('../models/Event');
const AuditLog = require('../models/AuditLog');

// GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const query = { unitId: req.user.unit };
    
    if (status) query.status = status;
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    res.json({ success: true, events });
  } catch (err) { next(err); }
};

// POST /api/events
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create({
      ...req.body,
      unitId: req.user.unit,
      createdBy: req.user._id
    });

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
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    
    res.json({ success: true, event });
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

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

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
