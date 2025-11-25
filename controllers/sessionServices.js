const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const ProgramType = require('../models/programTypeModel');

const checkOverLap = asyncHandler(async ({ teacherId, start, duration }) => {
  //session times
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const conflict = await Session.findOne({
    teacher: teacherId,
    status: { $in: ['pending', 'scheduled'] },
    $or: [
      {
        scheduledAt: { $gte: startDate, $lt: endDate },
      },
      {
        scheduledAt: { $lte: startDate },
        $expr: {
          $gt: [{ $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] }, startDate],
        },
      },
    ],
  }).lean();

  return !!conflict;
  // const conflict = await Session.findOne({
  //   teacher: teacherId,
  //   status: { $in: ['prnding', 'scheduled'] },
  //   $or: [
  //     {
  //       scheduledAt: { $gte: startDate, $lt: endDate },
  //     },
  //     {
  //       scheduledAt: { $lte: startDate },
  //       $expr: {
  //         $gt: [{ $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] }, startDate],
  //       },
  //     },
  //   ],
  // }).lean();

  // return !!conflict;
});

// helper: map different field names for weekly sessions
function getWeeklySessionsFromProgram(program) {
  return program.weeklySessions ?? program.sessionsPerWeek ?? 1;
}

function getDatesForWeekdays({ daysOfWeek = [], startDate = new Date(), totalSessions = 0 }) {
  const days = (daysOfWeek || []).map((d) => d.toLowerCase());
  if (!days || days.length === 0) return [];
  const weekdayIndex = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // convert day strings to numeric indices sorted ascending within week order
  const dayIndices = days
    .map((d) => (weekdayIndex[d] === undefined ? null : weekdayIndex[d]))
    .filter((i) => i !== null)
    .sort((a, b) => a - b);

  const results = [];
  let cursor = new Date(startDate);
  cursor.setSeconds(0, 0);

  while (results.length < totalSessions) {
    const dow = cursor.getDay();
    if (dayIndices.includes(dow)) {
      results.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

// helper: check teacher availability for a date/time
// teacherSchedule shape expected: [{ day: 'sunday', slots: [{start:'14:00', end:'16:00'}] }, ...]
function isTeacherAvailableAt(teacher, sessionDate) {
  const schedule =
    teacher.teacherProfile?.availabilitySchedule ??
    teacher.teacherProfile?.availability_schedule ??
    [];

  if (!schedule || !Array.isArray(schedule)) return false;

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  const dayName = daysOfWeek[sessionDate.getDay()];

  const dayRecord = schedule.find(
    (d) => String(d.day).toLowerCase() === String(dayName).toLowerCase()
  );
  if (!dayRecord) return false;

  const timeStr = sessionDate.toTimeString().substring(0, 5); // "HH:MM"
  // if slots missing or not array => unavailable
  if (!Array.isArray(dayRecord.slots) || dayRecord.slots.length === 0) return false;

  return dayRecord.slots.some((slot) => {
    // slot.start / slot.end expected "HH:MM"
    return timeStr >= slot.start && timeStr < slot.end;
  });
}

function parseSessionTime(raw) {
  if (!raw) return [];
  // If already an object (Postman JSON)
  if (typeof raw === 'object') return raw;

  // If string (Swagger sends strings)
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch (err) {
      throw new ApiError('Invalid time format. Must be valid JSON.', 400);
    }
  }

  return [];
}

// Utility: get next date for weekday (no ISO format needed)
function nextDateForDay(day, addDays = 0) {
  const map = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
    thursday: 4, friday: 5, saturday: 6
  };

  const today = new Date();
  const targetDay = map[day];
  const diff = (targetDay + 7 - today.getDay()) % 7;

  const result = new Date(today);
  result.setDate(today.getDate() + diff + addDays);

  return result;
}
// create all sessions for a plan
// planOptions: { programId, programModel, studentId, teacherId, sessionDuration, weeklySessions, planMonths, startDate, days }
// returns array of session documents (created)
exports.generatePlanSessions = asyncHandler(async (req, res, next) => {
  const { programModel } = req.body;
  const  programId  = req.params.id;

  const ProgramModel = {
    CorrectionProgram,
    MemorizationProgram,
    ChildMemorizationProgram,
  }[programModel];

  if (!ProgramModel) return next(new ApiError('Program not found', 404));
  // 2️⃣ Validate 

  const program = await ProgramModel.findById(programId);
  if (!program) return next(new ApiError('Program not found', 404));

  const teacherId = program.teacher;
  if (!teacherId) return next(new ApiError('Program has no assigned teacher', 400));

  // 2️⃣ Load teacher
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.status !== 'active') {
    return next(new ApiError('Teacher inactive or not found', 404));
  }

  const schedule = teacher.teacherProfile.availabilitySchedule;
  const weeklySessions = program.weeklySessions;
  const sessionDuration = program.sessionDuration;
  const planMonths = program.packageDuration;
  const totalWeeks = planMonths * 4;
  const totalSessions = totalWeeks * weeklySessions;

  // const preferredTimes = req.body.preferredTimes;

  // if (!Array.isArray(preferredTimes) || preferredTimes.length === 0) {
  //   return next(new ApiError('Preferred times are required to generate sessions', 400));
  // }

  const createdSessions = [];
  // 4️⃣ Loop for total number of sessions needed
  let sessionCounter = 0;
  let weekOffset = 0;

  while (sessionCounter < totalSessions) {
    for (const slotReq of preferredTimes) {
      if (sessionCounter >= totalSessions) break;

      const { day, start } = slotReq;

      // 5️⃣ Validate day availability
      const dayRecord = schedule.find((d) => d.day === day);
      if (!dayRecord) continue;

      // 6️⃣ Find a matching slot in teacher availability
      const slot = dayRecord.slots.find((s) => s.start === start);
      if (!slot) continue;

      // 7️⃣ Build date for this week's session
      const sessionDate = nextDateForDay(day, weekOffset);

      // 8️⃣ Check overlap using your internal logic
      const conflict = await checkOverLap({
        teacherId,
        start: sessionDate,
        duration: sessionDuration,
      });

      if (conflict) continue;
      // 9️⃣ Create session using same structure as single booking API
      const newSession = await Session.create({
        program: programId,
        programModel,
        student: program.student,
        teacher: teacherId,
        type: 'program',
        duration: sessionDuration,
        status: 'scheduled',
        scheduledAt: [
          {
            day,
            slots: [{ start }],
          },
        ],
      });

      createdSessions.push(newSession);

      // 🔟 Remove slot from teacher availability
      dayRecord.slots = dayRecord.slots.filter((s) => s.start !== start);

      sessionCounter++;
    }

    weekOffset += 7; // next week
  }

  await teacher.save();
  return res.status(201).json({
    status: 'success',
    totalCreated: createdSessions.length,
    createdSessions,
  });
});


exports.createTrialSession = asyncHandler(
  async ({ programId, programModel, studentId, teacherId, preferredTimes, days }) => {
    const existing = await Session.findOne({
      program: programId,
      student: studentId,
      type: 'trial',
    });
    if (existing) return existing;

    const trial = await Session.create({
      program: programId,
      programModel,
      student: studentId,
      teacher: teacherId,
      duration: 15,
      status: 'pending',
      preferredTimes,
      type: 'trial',
      days,
    });
    return trial;
  }
);

exports.bookProgramSession = asyncHandler(async (req, res, next) => {
  const { programId, programModel, teacherId, scheduledAt } = req.body;
  const ProgramModel = {
    CorrectionProgram,
    MemorizationProgram,
    ChildMemorizationProgram,
  }[programModel];

  if (!ProgramModel) return next(new ApiError('Program not found', 404));
  // 2️⃣ Validate program
  const program = await ProgramModel.findById(programId);
  if (!program) return next(new ApiError('Program not found', 404));

  // const studentId = req.user._id;
  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.status !== 'active') {
    return next(new ApiError('Selected teacher is not available', 403));
  }
  const schedule = teacher.teacherProfile.availabilitySchedule || [];
  // 3) Get day record
  const dayRecord = schedule.find((d) => d.day === scheduledAt.day);

  if (!dayRecord) {
    return next(new ApiError('Teacher not available on this day', 400));
  }

  // 4) Find slot
  const slot = dayRecord.slots.find((s) => s.start === scheduledAt.start);

  if (!slot) {
    return next(new ApiError('Selected time slot is not available', 400));
  }

  // 5) Build correct session payload (matches your Session model)
  const sessionPayload = {
    program: programId,
    programModel,
    student: req.user._id,
    teacher: teacherId,
    duration: program.sessionDuration,
    status: 'scheduled',
    type: 'program',

    scheduledAt: [
      {
        day: scheduledAt.day,
        slots: [
          { start: scheduledAt.start }, // your session model only has start
        ],
      },
    ],
  };

  const session = await Session.create(sessionPayload);

  // 6) Remove slot from teacher availability
  dayRecord.slots = dayRecord.slots.filter((s) => s.start !== scheduledAt.start);
  await teacher.save();

  return res.status(201).json({
    status: 'success',
    message: 'Session booked successfully',
    session,
  });
});

exports.trialSessionAccept = asyncHandler(async (req, res, next) => {
  const { scheduledAt, meetingLink } = req.body;

  const trial = await Session.findById(req.params.id);
  if (!trial) return next(new ApiError('Trial not found'));
  if (trial.type !== 'trial') {
    return next(new ApiError('This session is not a trial session', 400));
  }
  if (trial.teacher.toString() !== req.user._id.toString()) {
    return next(new ApiError('You are not authorized to schedule this trial', 403));
  }

  const conflict = await checkOverLap({
    teacherId: trial.teacher,
    start: scheduledAt,
    duration: trial.duration,
  });

  if (conflict) {
    return next(new ApiError('Teacher has session at the same time', 400));
  }

  trial.scheduledAt = scheduledAt;
  trial.meetingLink = meetingLink;
  trial.status = 'scheduled';

  await trial.save();

  res.status(200).json({
    status: 'success',
    message: 'Trial session confirmed',
    data: trial,
  });
});

exports.sessionCompleted = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.id;

  const session = await Session.findByIdAndUpdate(
    sessionId,
    {
      status: 'completed',
      completedAt: new Date(),
    },
    { new: true }
  );

  const teacher = await User.findById(session.teacher);
  if (teacher) {
    ((teacher.teacherProfile = teacher.teacherProfile || {}),
      (teacher.teacherProfile.fulfilledMinutes =
        (teacher.teacherProfile.fulfilledMinutes || 0) + (session.duration || 0)));
    await teacher.save();
  }
  res.status(200).json({
    status: 'success',
    message: 'Session marked as completed',
    data: session,
  });
});

exports.sessionStart = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.id;
  const session = await Session.findByIdAndUpdate(
    { _id: sessionId },
    {
      status: 'started',
      startedAt: new Date(),
    },
    { new: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'Session has started',
    data: session,
  });
});
