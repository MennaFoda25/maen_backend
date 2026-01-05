const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const ProgramType = require('../models/programTypeModel');
const crypto = require('crypto');
const { sendNotification } = require('../utils/sendNotification');


function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function removeBookedTimeFromSlots(dayRecord, bookingStart, bookingEnd) {
  const updatedSlots = [];
  for (const slot of dayRecord.slots) {
    const [sH, sM] = slot.start.split(':').map(Number);
    const [eH, eM] = slot.end.split(':').map(Number);

    const ref = new Date(bookingStart);
    const slotStart = new Date(ref);
    slotStart.setHours(sH, sM, 0, 0);
    const slotEnd = new Date(ref);
    slotEnd.setHours(eH, eM, 0, 0);

    if (bookingEnd <= slotStart || bookingStart >= slotEnd) {
      updatedSlots.push(slot);
      continue;
    }

    if (bookingStart > slotStart) {
      updatedSlots.push({
        start: slot.start,
        end: formatTime(bookingStart),
      });
    }

    if (bookingEnd < slotEnd) {
      updatedSlots.push({
        start: formatTime(bookingEnd),
        end: slot.end,
      });
    }
  }

  dayRecord.slots = updatedSlots;
}


// exports.bookSession = asyncHandler(async (req, res, next) => {
//   const { programId, programModel, teacherId, day, start } = req.body;

//   if (!programId || !teacherId || !day || !start) {
//     return next(new ApiError('Missing required booking data', 400));
//   }

//   const ProgramModel = {
//     MemorizationProgram,
//     CorrectionProgram,
//     ChildMemorizationProgram,
//   }[programModel];

//   if (!ProgramModel) {
//     return next(new ApiError('Invalid program model', 400));
//   }

//   const program = await ProgramModel.findById(programId);

//   if (!program) return next(new ApiError('Program not found', 404));

//   const teacher = await User.findOne({
//     _id: teacherId,
//     role: 'teacher',
//     status: 'active',
//   });

//   if (!teacher) {
//     return next(new ApiError('Teacher is not found', 404));
//   }

//   // 1️⃣ Validate teacher availability for day
//   const dayRecord = teacher.teacherProfile.availabilitySchedule.find(
//     (d) => d.day.toLowerCase() === day.toLowerCase()
//   );

//   if (!dayRecord) {
//     return next(new ApiError('Teacher not available on this day', 400));
//   }

//   // 2️⃣ Find slot that fits session duration
//   const duration = program.sessionDuration;

//   const slot = dayRecord.slots.find((s) => {
//     const [sh, sm] = s.start.split(':').map(Number);
//     const [eh, em] = s.end.split(':').map(Number);
//     const [rh, rm] = start.split(':').map(Number);

//     const slotStart = sh * 60 + sm;
//     const slotEnd = eh * 60 + em;
//     const reqStart = rh * 60 + rm;

//     return reqStart >= slotStart && reqStart + duration <= slotEnd;
//   });

//   if (!slot) {
//     return next(new ApiError('Selected time does not fit teacher availability', 400));
//   }

//   // 3️⃣ Compute scheduledAtDate
//   const computeDate = (day, time) => {
//     const map = {
//       sunday: 0,
//       monday: 1,
//       tuesday: 2,
//       wednesday: 3,
//       thursday: 4,
//       friday: 5,
//       saturday: 6,
//     };

//     const today = new Date();
//     const target = map[day.toLowerCase()];
//     const diff = (target + 7 - today.getDay()) % 7;

//     const d = new Date(today);
//     d.setDate(today.getDate() + diff);

//     const [h, m] = time.split(':').map(Number);
//     d.setHours(h, m, 0, 0);

//     return d;
//   };

//   const scheduledAtDate = computeDate(day, start);
//   const endDate = new Date(scheduledAtDate.getTime() + duration * 60000);

//   // 4️⃣ Create session
//   const session = await Session.create({
//     program: program._id,
//     programModel,
//     student: program.student || program.parent,
//     teacher: teacher._id,
//     duration,
//     type: 'program',
//     status: 'scheduled',
//     scheduledAtDate,
//     scheduledAt: [{ day, slots: [{ start }] }],
//   });

//   // 5️⃣ Remove booked time from teacher availability
//   removeBookedTimeFromSlots(dayRecord, scheduledAtDate, endDate);
//   await teacher.save();

//   // 6️⃣ Notify
//   await sendNotification(teacher, {
//     title: 'New Session Booked 📅',
//     body: `A session was booked on ${day} at ${start}`,
//     data: { sessionId: session._id.toString() },
//   });

//   res.status(201).json({
//     status: 'success',
//     message: 'Session booked successfully',
//     data: session,
//   });
// });
// exports.generatePlanSessions = asyncHandler(async (req, res, next) => {
//   const { programModel } = req.body;
//   const programId = req.params.id;

//   const ProgramModel = {
//     CorrectionProgram,
//     MemorizationProgram,
//     ChildMemorizationProgram,
//   }[programModel];

//   if (!ProgramModel) return next(new ApiError('Program not found', 404));
//   const program = await ProgramModel.findById(programId);
//   if (!program) return next(new ApiError('Program not found', 404));

//   const teacher = await User.findById(program.teacher);
//   if (!teacher) return next(new ApiError('Teacher not found', 404));

//   // ✨ VALIDATION: Check if teacher is dedicated to this program type
//   const teacherPreferences = teacher.teacherProfile?.programPreference || [];
//   const programType = await ProgramType.findOne({ key: programModel });

//   if (programType && teacherPreferences.length > 0) {
//     const isDedicatedToProgram = teacherPreferences.some(
//       (pref) => pref._id.toString() === programType._id.toString()
//     );

//     if (!isDedicatedToProgram) {
//       return next(
//         new ApiError(
//           `Teacher is not dedicated to ${programModel}. Teacher specializes in: ${teacherPreferences.join(', ')}`,
//           403
//         )
//       );
//     }
//   }

//   // Call the core logic which validates and creates sessions
//   const created = await generatePlanSessionsLogic(program, teacher, programModel);

//   return res.status(201).json({
//     status: 'success',
//     totalCreated: created.length,
//     sessions: created,
//   });
// });

// exports.createTrialSession = asyncHandler(
//   async ({ programId, programModel, studentId, teacherId, preferredDays, days }) => {
//     const existing = await Session.findOne({
//       program: programId,
//       student: studentId,
//       type: 'trial',
//     });
//     if (existing) return existing;

//     const trial = await Session.create({
//       program: programId,
//       programModel,
//       student: studentId,
//       teacher: teacherId,
//       duration: 15,
//       status: 'pending',
//       preferredTimes,
//       type: 'trial',
//       days,
//       meetingId: crypto.randomBytes(8).toString('hex'), // <— UNIQUE TRIAL ID
//     });
//     return trial;
//   }
// );

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

  const student = await User.findById(session.student);
  const teacher = await User.findById(session.teacher);

  const payload = {
    title: 'Session Started ⏰',
    body: 'Your session has just started.',
    data: {
      sessionId: session._id.toString(),
      type: 'session',
    },
  };

  await sendNotification(student, payload);
  await sendNotification(teacher, payload);

  res.status(200).json({
    status: 'success',
    message: 'Session has started',
    data: session,
  });
});
