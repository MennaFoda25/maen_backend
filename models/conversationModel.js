const mongoose = require('mongoose');


const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    attachmentUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true } // each message gets its own ObjectId
);

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.ObjectId, ref: 'User', required: true }],
    lastMessage: String,
    lastMessageAt: {type:Date, default:Date.now},
    messages: [messageSchema]
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
