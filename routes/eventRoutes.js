const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { allowedTo } = require('../controllers/authServices');
const { uploadFiles } = require('../middlewares/uploadFilesMiddleware');
const { firebaseAuth } = require('../middlewares/firebaseAuth');
const {
  createEventValidator,
  getEventByIdValidator,
  deleteEventValidator,
  updateEventValidator,
} = require('../utils/validators/eventValidator');

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventByIdValidator, getEventById);

// Protected routes (Admin only)
router.post('/', firebaseAuth, allowedTo('admin'), uploadFiles, createEventValidator, createEvent);
router.patch(
  '/:id',
  firebaseAuth,
  allowedTo('admin'),
  uploadFiles,
  updateEventValidator,
  updateEvent
);
router.delete('/:id', firebaseAuth, allowedTo('admin'), deleteEventValidator, deleteEvent);

module.exports = router;
