const Conversation = require('../models/conversationModel');
//const Message = require('../models/messageModel');
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
// exports.createConversation = asyncHandler(async (req, res, next) => {
//   const senderId = req.user._id.toString();
//   const receiverId = req.body.receiverId;

//   if (!receiverId) return next(new ApiError('receiverId is required', 400));
//   if (receiverId === senderId)
//     return next(new ApiError('Cannot create conversation with yourself', 400));
//   // Validate receiver exists and is a user
//   const receiver = await User.findById(receiverId).select('name role');
//   if (!receiver) return next(new ApiError('Receiver not found', 404));

//   // Find existing conversation regardless of participants order
//   let conversation = await Conversation.findOne({
//     participants: { $all: [senderId, receiverId] },
//   }).populate('participants', 'name profile_picture');;

//   if (!conversation) {
//     // Create with deterministic order (optional): sort ids so duplicate orders are consistent
//     const participants = [senderId, receiverId].sort();
//     conversation = await Conversation.create({
//       participants,
//       lastMessage: '',
//       lastMessageAt: new Date(),
//     });
//   }

//   // populate participants basic info
//   //await conversation.populate({ path: 'participants', select: 'name role' }).execPopulate?.();

//   res.status(200).json({ status: 'success', conversation });
// });

/**
 * POST /chat/messages
 * Body: { conversationId, text, attachmentUrl }
 * Sends a message. Sender must be one of conversation participants.
 */
// exports.createOrSendMessage = asyncHandler(async (req, res, next) => {
//   const senderId = req.user._id.toString();
//   const { receiverId, conversationId, text, attachmentUrl } = req.body;
//   if (!text && !attachmentUrl)
//     return next(new ApiError('Message text or attachment is required', 400));

//   let conversation;
//   // CASE A: conversationId provided → send message
//   // -----------------------------------------------------
//   if (conversationId) {
//     conversation = await Conversation.findById(conversationId);
//     if (!conversation) return next(new ApiError('Conversation not found', 404));

//     if (!conversation.participants.includes(senderId))
//       return next(new ApiError('You are not part of this conversation', 403));
//   } else {
//     // -----------------------------------------------------
//     // CASE B: no conversationId → create OR fetch by receiverId
//     // -----------------------------------------------------
//     if (!receiverId)
//       return next(new ApiError('receiverId is required when conversationId is not sent', 400));

//     if (receiverId === senderId)
//       return next(new ApiError('Cannot create conversation with yourself', 400));

//     const receiver = await User.findById(receiverId);
//     if (!receiver) return next(new ApiError('Receiver not found', 404));

//     // Search for existing conversation
//     conversation = await Conversation.findOne({
//       participants: { $all: [senderId, receiverId] },
//     });
//     // If conversation doesn't exist → create new
//     if (!conversation) {
//       const participants = [senderId, receiverId].sort();
//       conversation = await Conversation.create({
//         participants,
//         lastMessage: '',
//         lastMessageAt: new Date(),
//       });
//     }
//   }
//   // 2) ADD MESSAGE
//   // -----------------------------
//   const newMessage = {
//     sender: senderId,
//     text: text || '',
//     attachmentUrl: attachmentUrl || null,
//     createdAt: new Date(),
//   };

//   conversation.messages.push(newMessage);

//   // Update preview
//   conversation.lastMessage = text || (attachmentUrl ? 'Attachment' : '');
//   conversation.lastMessageAt = new Date();

//   await conversation.save();

//   // Populate the sender info for frontend
//   const populatedMessage = conversation.messages.at(-1);

//   res.status(200).json({
//     status: 'success',
//     conversationId: conversation._id,
//     message: populatedMessage,
//   });
// });

exports.chatWithUser = asyncHandler(async (req, res, next) => {
  const senderId = req.user._id.toString();
  const { receiverId, text, attachmentUrl } = req.body;

  if (!receiverId) {
    return next(new ApiError('receiverId is required', 400));
  }

  // if (!text && !attachmentUrl) {
  //   return next(new ApiError("Message text or attachment is required", 400));
  // }

  // Validate receiver exists
  const receiver = await User.findById(receiverId).select('name role');
  if (!receiver) return next(new ApiError('Receiver not found', 404));

  // 1️⃣ Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    const participants = [senderId, receiverId].sort();
    conversation = await Conversation.create({
      participants,
      messages: [],
      lastMessage: '',
      lastMessageAt: new Date(),
    });
  }

  // 2️⃣ Push message
  const message = {
    sender: senderId,
    text: text || '',
    attachmentUrl: attachmentUrl || null,
    createdAt: new Date(),
  };

  conversation.messages.push(message);

  // 3️⃣ Update conversation preview
  conversation.lastMessage = text || (attachmentUrl ? 'Attachment' : '');
  conversation.lastMessageAt = new Date();

  await conversation.save();

  // 4️⃣ Populate participants
  await conversation.populate('participants', 'name profile_picture');

  res.status(200).json({
    status: 'success',
    conversation,
  });
});

/**
 * GET /chat/messages/:conversationId?page=1&limit=30
 * Returns messages in ascending order. Only participants can read.
 */

// exports.getMessages = asyncHandler(async (req, res, next) => {
//   const receiverId = req.params.receiverId;
//   const receiver = await User.findById(receiverId).select("name role");
//   if (!receiver) return next(new ApiError("Receiver not found", 404));

//   // 1️⃣ Find or create conversation
//   // let conversation = await Conversation.findOne({
//   //   participants: { $all: [ receiverId] },
//   // });

//   const conversation = await Conversation.findById(conversationId).populate(
//     'messages.sender',
//     'name profile_picture'
//   );
//   if (!conversation) return next(new ApiError('Conversation not found', 404));

//   //   const userId = req.user._id.toString();
//   //   const isParticipant = conversation.participants.some((p) => p.toString() === userId);
//   //   if (!isParticipant) return next(new ApiError('Not authorized to view messages', 403));
//   //   const total = await Message.countDocuments({ conversation: conversationId });

//   //   const messages = await Message.find({ conversation: conversationId })
//   //     .sort({ createdAt: 1 }) // oldest -> newest
//   //     .skip(skip)
//   //     .limit(limit)
//   //     .populate('sender', 'name profile_picture')
//   //     .lean();

//   res.status(200).json({
//     status: 'success',
//     // pagination: { page, limit, total, pages: Math.ceil(total / limit) },
//     messages: conversation.messages,
//   });
// });

exports.getMessages = asyncHandler(async (req, res, next) => {
  const receiverId = req.params.receiverId;
  const userId = req.user._id;

  // 1️⃣ Validate receiver exists
  const receiver = await User.findById(receiverId).select('name role profile_picture');
  if (!receiver) return next(new ApiError('Receiver not found', 404));

  // 2️⃣ Find the conversation between user and receiver
  const conversation = await Conversation.findOne({
    participants: { $all: [receiverId, req.user._id] },
  })
    .populate('messages.sender', 'name profile_picture')
    .lean();

  // If no conversation, return empty array
  if (!conversation) {
    return res.status(200).json({
      status: 'success',
      messages: [],
      receiver: {
        _id: receiver._id,
        name: receiver.name,
        role: receiver.role,
        profile_picture: receiver.profile_picture,
      },
    });
  }

  // 3️⃣ Return all messages
  res.status(200).json({
    status: 'success',
    conversationId: conversation._id,
    participants: conversation.participants,
    messages: conversation.messages,
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
    participants: userId.toString(),
  })
    .populate('participants', 'name ')
    .populate('messages.sender', 'name  ')
    .sort({ lastMessageAt: -1 })
    .lean();

     // 🔥 Remove teacherProfile manually if still present
  conversations.forEach((conv) => {
    conv.participants.forEach((p) => {
      delete p.teacherProfile; // 🔥 safely removed
    });
    conv.messages.forEach((m) => {
      if (m.sender) delete m.sender.teacherProfile; // 🔥 safely removed
    });
  });
  res.status(200).json({ status: 'success', count: conversations.length, conversations });
});
