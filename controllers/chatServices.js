const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel'); // adjust path if needed
const Session = require('../models/sessionModel'); // optional checks
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const CorrectionProgram = require('../models/correctionProgramModel');


/**
 * POST /chat/conversation
 * Body: { receiverId }
 * Creates OR returns the existing conversation between req.user and receiverId.
 */
exports.createConversation = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id.toString();
  const receiverId = req.body.receiverId;

  if (!receiverId) return next(new ApiError('receiverId is required', 400));
  if (receiverId === senderId)
    return next(new ApiError('Cannot create conversation with yourself', 400));
  // Validate receiver exists and is a user
  const receiver = await User.findById(receiverId).select('name role');
  if (!receiver) return next(new ApiError('Receiver not found', 404));

  // Find existing conversation regardless of participants order
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate('participants', 'name profile_picture');;

  if (!conversation) {
    // Create with deterministic order (optional): sort ids so duplicate orders are consistent
    const participants = [senderId, receiverId].sort();
    conversation = await Conversation.create({
      participants,
      lastMessage: '',
      lastMessageAt: new Date(),
    });
  }

  // populate participants basic info
  //await conversation.populate({ path: 'participants', select: 'name role' }).execPopulate?.();

  res.status(200).json({ status: 'success', conversation });
});

/**
 * POST /chat/messages
 * Body: { conversationId, text, attachmentUrl }
 * Sends a message. Sender must be one of conversation participants.
 */
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { conversationId, text, attachmentUrl } = req.body;
 // if (!conversationId || !text)
//return next(new ApiError('conversationId and text is required', 400));

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) return next(new ApiError('Conversation not found', 404));

  const senderId = req.user._id.toString();
//const isParticipant = conversation.participants.some((p) => p.toString() === senderId);

  if (!conversation.participants.includes(senderId)) return next(new ApiError("Can't send messages in this conversation", 403));

  conversation.messages.push({
    sender: senderId,
    text: text || '',
    attachmentUrl: attachmentUrl || null,
    createdAt: new Date()
  });
  // Update conversation preview
  conversation.lastMessage = text ||( attachmentUrl ? 'Attachment' : '');
  conversation.lastMessageAt = new Date();
  await conversation.save();

//   const populated = await Message.findById(message._id)
//     .populate('sender', 'name profile_picture')
//     .lean();
  res.status(201).json({ status: 'success', message: conversation.messages.at(-1) });
});

/**
 * GET /chat/messages/:conversationId?page=1&limit=30
 * Returns messages in ascending order. Only participants can read.
 */

exports.getMessages = asyncHandler(async (req, res, next) => {
  const conversationId = req.params.conversationId;

  const conversation = await Conversation.findById(conversationId).populate('messages.sender', 'name profile_picture');;
  if (!conversation) return next(new ApiError('Conversation not found', 404));

//   const userId = req.user._id.toString();
//   const isParticipant = conversation.participants.some((p) => p.toString() === userId);
//   if (!isParticipant) return next(new ApiError('Not authorized to view messages', 403));
//   const total = await Message.countDocuments({ conversation: conversationId });

//   const messages = await Message.find({ conversation: conversationId })
//     .sort({ createdAt: 1 }) // oldest -> newest
//     .skip(skip)
//     .limit(limit)
//     .populate('sender', 'name profile_picture')
//     .lean();

  res.status(200).json({
    status: 'success',
   // pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    messages:conversation.messages,
  });
});

/**
 * GET /chat/myConversations
 * Returns conversations for current user, sorted by lastMessageAt,
 * with unread counts per conversation.
 */
exports.getMyConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate('participants', 'name profile_picture')
    .populate('messages.sender', 'name profile_picture')
    .sort({ lastMessageAt: -1 });

//   const convIds = conversations.map((c) => c._id);

//   // unread counts grouped by conversation
//   const unreadCounts = await Message.aggregate([
//     { $match: { conversation: { $in: convIds }, sender: { $ne: userId }, isRead: false } },
//     { $group: { _id: '$conversation', unread: { $sum: 1 } } },
//   ]);

//   const unreadMap = unreadCounts.reduce((acc, cur) => {
//     acc[cur._id.toString()] = cur.unread;
//     return acc;
//   }, {});

//   const enriched = conversations.map((c) => ({
//     ...c,
//     unreadCount: unreadMap[c._id.toString()] || 0,
//   }));

  res.status(200).json({ status: 'success', count: conversations.length, conversations });
});
