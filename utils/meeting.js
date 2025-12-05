const crypto = require('crypto');

async function ensureProgramMeetingId(program) {
  if (!program.meetingId) {
    program.meetingId = crypto.randomBytes(8).toString('hex');
    await program.save();
  }

  return program.meetingId;
}

module.exports = { ensureProgramMeetingId };
