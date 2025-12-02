const crypto = require('crypto')
const programTypeModel = require('../models/programTypeModel')

async function ensureProgramMeetingId(){
if(!programTypeModel.meetingId){
    program.meetingId = crypto.randomBytes(8).toString('hex')
    await program.save()
}
return program.meetingId
}
module.exports = { ensureProgramMeetingId };