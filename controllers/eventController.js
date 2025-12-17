const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const ApiError = require('../utils/apiError');
const { sendNotification } = require('../utils/sendNotification');
const User = require('../models/userModel');

// @desc    Create a new event with image
// @route   POST /api/v1/events
// @access  Private (Admin)
exports.createEvent = asyncHandler(async (req, res, next) => {
  const { title, description, startDate, endDate, price, notification } = req.body;

  // Get image URL from uploaded files
  const imageUrl = req.uploadedFiles?.eventImage?.[0]?.fileUrl;
  if (!imageUrl) {
    return next(new ApiError('Event image is required', 400));
  }

  console.log(`✅ Image URL: ${imageUrl}`);

  // Create event (validation is done by validator middleware)
  const event = await Event.create({
    title,
    description: description || '',
    imageUrl,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    isActive: true,
    price,
  });

  const students = await User.find({ role: 'student', notificationToken: { $ne: null } }).select(
    'notificationToken'
  );

  // 🔔 SEND NOTIFICATIONS
  await Promise.all(
    students.map((student) =>
      sendNotification({
        token: student.notificationToken,
        title: 'New Event Available 🎉',
        body: event.title,
        data: {
          eventId: event._id.toString(),
          type: 'EVENT_CREATED',
        },
      })
    )
  );

  console.log(`✨ Event created successfully with ID: ${event._id}`);

  res.status(201).json({
    status: 'success',
    message: 'Event created successfully',
    data: event,
  });
});

// @desc    Get all events with filters for active/inactive
// @route   GET /api/v1/events?isActive=true
// @access  Public
exports.getAllEvents = asyncHandler(async (req, res, next) => {
  try {
    const now = new Date();
    // Count total events first
    const totalCount = await Event.countDocuments({});

    // Get all events without any filter initially
    const allEvents = await Event.find({}).sort({ startDate: -1 }).lean();

    if (allEvents.length > 0) {
      console.log(`\nEvent details:`);
      allEvents.forEach((e, i) => {
        console.log(`  ${i + 1}. "${e.title}"`);
        console.log(`     Start: ${e.startDate?.toISOString()}`);
        console.log(`     End: ${e.endDate?.toISOString()}`);
        console.log(`     isActive: ${e.isActive}`);
      });
    }

    // Apply filters based on query params if provided
    let filteredEvents = [...allEvents];
    const { isActive } = req.query;

    console.log(`\n🔍 Filter check: isActive="${isActive}"`);

    if (typeof isActive === 'string') {
      const filterValue = isActive === 'true';
      filteredEvents = allEvents.filter((e) => e.isActive === filterValue);
      console.log(`✅ Applied isActive filter: ${filterValue}`);
      console.log(`   Returned ${filteredEvents.length} events`);
    } else {
      console.log(`✅ No filter applied - returning all ${allEvents.length} events`);
    }

    // Add computed status to each event (based on current time)
    const enrichedEvents = filteredEvents.map((e) => ({
      ...e,
      computedStatus: e.startDate <= now && e.endDate >= now ? 'active' : 'inactive',
    }));

    console.log(`\n📤 Final Response: ${enrichedEvents.length} events`);
    console.log(`📋 === GET ALL EVENTS END ===\n`);

    res.status(200).json({
      status: 'success',
      count: enrichedEvents.length,
      totalInDatabase: totalCount,
      data: enrichedEvents,
    });
  } catch (error) {
    console.error(`❌ Error in getAllEvents:`, error);
    throw error;
  }
});

// @desc    Get a specific event by ID
// @route   GET /api/v1/events/:id
// @access  Public
exports.getEventById = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).lean();

  if (!event) {
    return next(new ApiError('Event not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: event,
  });
});

// @desc    Update an event
// @route   PATCH /api/v1/events/:id
// @access  Private (Admin)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  const { title, description, startDate, endDate, isActive, price } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(new ApiError('Event not found', 404));
  }

  // Prepare new values for validation
  const newTitle = title || event.title;
  const newStartDate = startDate ? new Date(startDate) : event.startDate;
  const newEndDate = endDate ? new Date(endDate) : event.endDate;

  // Validate dates if being updated
  if (startDate && endDate) {
    if (newStartDate >= newEndDate) {
      return next(new ApiError('Start date must be before end date', 400));
    }
  }

  // 🔍 Check for duplicate event (same title and overlapping dates), excluding current event
  const existingEvent = await Event.findOne({
    _id: { $ne: req.params.id }, // Exclude current event
    title: { $regex: `^${newTitle}$`, $options: 'i' }, // Case-insensitive title match
    $or: [
      // Check if new event overlaps with existing event dates
      {
        startDate: { $lte: newEndDate },
        endDate: { $gte: newStartDate },
      },
    ],
  });

  if (existingEvent) {
    return next(
      new ApiError(
        `An event with title "${newTitle}" already exists during this time period (${existingEvent.startDate.toDateString()} to ${existingEvent.endDate.toDateString()})`,
        409
      )
    );
  }

  // Update fields if provided
  if (title) event.title = title;
  if (description) event.description = description;

  if (startDate && endDate) {
    event.startDate = newStartDate;
    event.endDate = newEndDate;
  }

  if (isActive !== undefined) {
    event.isActive = isActive;
  }
  if (price) event.price = price;
  // Update image if provided
  if (req.uploadedFiles?.eventImage?.[0]?.fileUrl) {
    event.imageUrl = req.uploadedFiles.eventImage[0].fileUrl;
  }

  await event.save();

  res.status(200).json({
    status: 'success',
    message: 'Event updated successfully',
    data: event,
  });
});

// @desc    Delete an event
// @route   DELETE /api/v1/events/:id
// @access  Private (Admin)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);

  if (!event) {
    return next(new ApiError('Event not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Event deleted successfully',
    data: null,
  });
});
