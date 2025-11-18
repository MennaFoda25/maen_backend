const mongoose = require('mongoose');

const programTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    //unique: true,
  },
  key: {
    type: String, // 'correction', 'memorization', 'child_memorization'
    required: true,
    //unique: true,
    enum: ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'],
  },
  teachers: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

module.exports = mongoose.model('ProgramType', programTypeSchema);
