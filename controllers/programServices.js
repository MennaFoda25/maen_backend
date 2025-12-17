const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const factory = require('./handlerFactory');
const asyncHandler = require('express-async-handler');
const ProgramType = require('../models/programTypeModel');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildProgram = require('../models/childMemoProgramModel');
const crypto = require('crypto');
const { sendNotification } = require('../utils/sendNotification');

const { slotCovers } = require('../utils/time');

async function findProgramById(programId) {
  const models = {
    CorrectionProgram,
    MemorizationProgram,
    ChildProgram,
  };

  for (const [modelName, Model] of Object.entries(models)) {
    const doc = await Model.findById(programId);
    if (doc) return { modelName, program: doc }; // 👈 modelName instead of "model"
  }
  return null;
}
function removeBookedTimeFromSlots(dayRecord, startDate, endDate) {
  if (!dayRecord || !dayRecord.slots) return;

  const bookedStart = startDate.getHours() * 60 + startDate.getMinutes();
  const bookedEnd = endDate.getHours() * 60 + endDate.getMinutes();

  const newSlots = [];

  for (const slot of dayRecord.slots) {
    const [sH, sM] = slot.start.split(':').map(Number);
    const [eH, eM] = slot.end.split(':').map(Number);

    const slotStart = sH * 60 + sM;
    const slotEnd = eH * 60 + eM;

    // Case 1: booked session is outside this slot → keep entire slot
    if (bookedEnd <= slotStart || bookedStart >= slotEnd) {
      newSlots.push(slot);
      continue;
    }

    // Case 2: booked session splits slot into 2 parts
    if (bookedStart > slotStart) {
      newSlots.push({
        start: slot.start,
        end: toTimeString(bookedStart),
      });
    }

    if (bookedEnd < slotEnd) {
      newSlots.push({
        start: toTimeString(bookedEnd),
        end: slot.end,
      });
    }
  }

  dayRecord.slots = newSlots;
}

// Helper to convert minutes → "HH:MM"
function toTimeString(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Helper to convert minutes → "HH:MM"
function toTimeString(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function teacherMatchesStudentPreferences(teacherSchedule, preferredTimes) {
  // Each preferredTime must be matched by at least one available teacher slot
  return preferredTimes.every((pref) => {
    const dayRecord = teacherSchedule.find((d) => d.day.toLowerCase() === pref.day.toLowerCase());

    if (!dayRecord || !dayRecord.slots || !dayRecord.slots.length) return false;

    return dayRecord.slots.some((slot) => {
      return slot.start <= pref.start && slot.end >= pref.end;
    });
  });
}

function computeNextDate(day, time) {
  const map = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const today = new Date();
  const target = map[day.toLowerCase()];
  const diff = (target + 7 - today.getDay()) % 7;

  const d = new Date(today);
  d.setDate(today.getDate() + diff);

  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);

  return d;
}

//module.exports = teacherMatchesPreferredTimes;
exports.getAvailableTeachersByPreferredTimes = asyncHandler(async (req, res, next) => {
  const programId = req.params.id;

  // 1️⃣ Find program regardless of model type
  const result = await findProgramById(programId);
  if (!result) return next(new ApiError('Program not found', 404));

  const { modelName, program } = result;

  // 2️⃣ Extract programModel from program definition
  const programModel =
    program.constructor.modelName || // "CorrectionProgram" / "MemorizationProgram" / ...
    program.programTypeKey ||
    modelName;
  console.log('🟦 Required programModel:', programModel);

  // 3️⃣ Validate preferredTimes
  const preferredTimes = Array.isArray(program.preferredTimes) ? program.preferredTimes : [];

  if (!preferredTimes.length) {
    return next(new ApiError('Program does not have preferredTimes', 400));
  }

  // 4️⃣ Get matching ProgramType
  const requiredProgramType = await ProgramType.findOne({ key: programModel });

  if (!requiredProgramType) {
    console.log('❌ ProgramType not found for key:', programModel);
    return next(new ApiError('ProgramType not found for this program', 500));
  }

  // 5️⃣ Find teachers who specialize in this program type
  let teachers = await User.find({
    role: 'teacher',
    'teacherProfile.programPreference': requiredProgramType._id,
  })
    .select('name profile_picture teacherProfile.availabilitySchedule')
    .lean();

  // 6️⃣ Filter teachers whose availability covers ALL student's preferred times
  teachers = teachers.filter((t) =>
    teacherMatchesStudentPreferences(t.teacherProfile?.availabilitySchedule || [], preferredTimes)
  );

  // 7️⃣ Cleanup response (remove teacherProfile)
  const cleanedTeachers = teachers.map((t) => ({
    _id: t._id,
    name: t.name,
    profile_picture: t.profile_picture,
  }));

  res.status(200).json({
    status: 'success',
    count: cleanedTeachers.length,
    programId,
    programModel,
    preferredTimes,
    teachers: cleanedTeachers,
  });
});

exports.getProgramTypes = asyncHandler(async (req, res, next) => {
  const programTypes = await ProgramType.find();

  const results = [];

  for (const p of programTypes) {
    const teachers = await User.find({
      role: 'teacher',
      status: 'active',
      'teacherProfile.programPreference': p._id,
    }).select('name email profile_picture rating');

    results.push({
      programType: p,
      teachers,
      teacherCount: teachers.length,
    });
    await p.save();
  }

  res.status(200).json({
    status: 'success',
    programCount: results.length,
    data: results,
  });
});
// exports.createTrialSession = asyncHandler(async (program, teacherId, studentId, programModel) => {
//   if (!teacherId) return null;

//   const teacher = await User.findById(teacherId);

//   if (!teacher || teacher.status !== 'active') {
//     return next(new ApiError('Selected teacher is not available', 403));
//   }

//   const trial = await Session.create({
//     program: program._id,
//     programModel,
//     student: studentId,
//     teacher: teacherId,
//     duration: 15,
//     status: 'pending',
//     days: program.days,
//   });
//   return trial;
// });

exports.getAllFreeTrials = asyncHandler(async (req, res, next) => {
  const freeTrials = await Session.find({ type: 'trial' })
    .populate('program', 'programTypeKey')
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  res.status(200).json({
    status: 'success',
    count: freeTrials.length,
    data: freeTrials,
  });
});

exports.getTopTeachers = asyncHandler(async (req, res, next) => {
  // 1) fetch all teachers with ratings
  const teachers = await User.find({
    role: 'teacher',
    status: 'active',
    rating: { $gte: 0 },
  })
    .select('name email profile_picture rating ratingCount teacherProfile')
    .lean();

  // 2) sort by highest rating
  const top = teachers.sort((a, b) => b.rating - a.rating).slice(0, 5);

  // 3) respond
  res.status(200).json({
    status: 'success',
    count: top.length,
    data: top,
  });
});

// exports.getProgramTeachers = asyncHandler(async (req, res, next) => {
//   const program = req.query.program;

//   const validPrograms = ['CorrectionProgram', 'MemorizationProgram', 'ChildMemorizationProgram'];

//   if (!validPrograms.includes(program)) {
//     return next(
//       new ApiError('Invalid program type. Valid: correction, memorization, kids_memorization', 400)
//     );
//   }

//   const teachers = await User.find({
//     role: 'teacher',
//     status: 'active',
//     'teacherProfile.programPreference': program,
//   }).select('name email profile_picture rating ratingCount teacherProfile');

//   res.status(200).json({
//     status: 'success',
//     count: teachers.length,
//     data: teachers,
//   });
// });

exports.getTeachersByProgramType = asyncHandler(async (req, res) => {
  const programId = req.params.id;

  const teachers = await User.find({
    role: 'teacher',
    status: 'active',
    'teacherProfile.programPreference': programId,
  });

  res.status(200).json({
    status: 'success',
    count: teachers.length,
    data: teachers,
  });
});

exports.getAllLoggedStudentPrograms = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  const teacherFilter = {
    teacher: {$exists: true}
  }
  const memorizationPrograms = await MemorizationProgram.find({ student: studentId, ...teacherFilter }).select(
    '-__v'
  );
  const correctionPrograms = await CorrectionProgram.find({ student: studentId,...teacherFilter }).select('-__v');
  const childPrograms = await ChildProgram.find({ parent: studentId, ...teacherFilter }).select('-__v');

  res.status(200).json({
    status: 'success',
    count: memorizationPrograms.length + correctionPrograms.length + childPrograms.length,
    data: {
      memorizationPrograms,
      correctionPrograms,
      childPrograms,
    },
  });
});

exports.getTeacherSchedulesById = asyncHandler(async (req, res, next) => {
  const teacherId = req.params.id;

  const teacher = await User.findOne({ _id: teacherId, role: 'teacher', status: 'active' });

  if (!teacher) return next(new ApiError('Teacher not found', 404));

  res.status(200).json({
    status: 'success',
    data: teacher.teacherProfile.availabilitySchedule,
  });
});

exports.deleteProgram = asyncHandler(async (req, res, next) => {
  const programId = req.params.id;
  const studentId = req.user._id;

  // Try all models
  const program =
    (await CorrectionProgram.findById(programId)) ||
    (await MemorizationProgram.findById(programId)) ||
    (await ChildProgram.findById(programId));

  if (!program) {
    return next(new ApiError('Program not found', 404));
  }

  // Ownership validation depending on model
  const isOwner =
    program.student?.toString() === studentId.toString() ||
    program.parent?.toString() === studentId.toString();

  if (!isOwner) {
    return next(new ApiError('You are not allowed to delete this program', 403));
  }

  // Determine correct model to delete
  let Model;
  if (program.programTypeKey === 'CorrectionProgram') Model = CorrectionProgram;
  else if (program.programTypeKey === 'MemorizationProgram') Model = MemorizationProgram;
  else if (program.programTypeKey === 'ChildMemorizationProgram') Model = ChildProgram;
  else return next(new ApiError('Unknown program type', 400));

  await Model.findByIdAndDelete(programId);

  res.status(200).json({
    status: 'success',
    message: 'Program deleted successfully',
  });
});

function resolveStudentId(program) {
  if (program.student) return program.student;
  if (program.parent) return program.parent;

  throw new ApiError('Program has no student or parent reference', 500);
}


async function generatePlanSessionsLogic(program, teacher, programModel) {
  const schedule = teacher?.teacherProfile?.availabilitySchedule || [];

  const weeklySessions = program.weeklySessions;
  const duration = program.sessionDuration; // minutes
  const weeks = program.packageDuration * 4; // 3 months → 12 weeks
  const totalSessions = weeklySessions * weeks;
  const programId = program._id;
  if (!Array.isArray(program.preferredTimes) || program.preferredTimes.length === 0) {
    throw new ApiError('Program must have preferred times specified', 400);
  }

  
  // Normalize preferredTimes
  let preferred = program.preferredTimes
    .filter((t) => t?.day && t?.start)
    .map((t) => ({
      day: t.day.toLowerCase(),
      start: t.start,
      end: t.end,
    }));

  // Filter preferredTimes to only those the teacher can actually host
  const validPreferred = preferred.filter((p) => {
    const dayRec = schedule.find((d) => d.day.toLowerCase() === p.day);
    if (!dayRec || !Array.isArray(dayRec.slots) || !dayRec.slots.length) return false;

    return dayRec.slots.some((slot) => {
      return slot.start <= p.start && slot.end >= p.end;
    });
  });

  if (validPreferred.length === 0) {
    throw new ApiError(`Teacher does not match any preferred times for ${programModel}`, 400);
  }

  // Expand valid preferredTimes to match weeklySessions requirement
  let expandedPreferred = [];
  while (expandedPreferred.length < weeklySessions) {
    expandedPreferred.push(...validPreferred);
  }
  preferred = expandedPreferred.slice(0, weeklySessions);

  // Helper for computing dates
  const computeDate = (day, time, weekOffset) => {
    const map = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const today = new Date();
    const target = map[day];
    const diff = (target + 7 - today.getDay()) % 7;

    const d = new Date(today);
    d.setDate(today.getDate() + diff + weekOffset * 7);

    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);

    return d;
  };

  const created = [];

  console.log(
    `📊 Generating ${totalSessions} sessions (${weeklySessions}/week for ${weeks} weeks)`
  );

  // MAIN GENERATION LOOP
  for (let w = 1; w <= weeks && created.length < totalSessions; w++) {
    // Start from week 1 to avoid conflict with trial session in week 0
    let createdThisWeek = 0;

    for (const pref of preferred) {
      if (createdThisWeek >= weeklySessions) break;
      if (created.length >= totalSessions) break;

      const dayRecord = schedule.find((d) => d.day.toLowerCase() === pref.day);
      if (!dayRecord || !dayRecord.slots?.length) continue;

      const startDate = computeDate(pref.day, pref.start, w);
      const endDate = new Date(startDate.getTime() + duration * 60000);

      // Ensure session fits at least one slot
      const fitsSomeSlot = dayRecord.slots.some((slot) => {
        const [hs, ms] = slot.start.split(':').map(Number);
        const [he, me] = slot.end.split(':').map(Number);

        const slotStart = new Date(startDate);
        slotStart.setHours(hs, ms, 0, 0);

        const slotEnd = new Date(startDate);
        slotEnd.setHours(he, me, 0, 0);

        return slotStart <= startDate && slotEnd >= endDate;
      });

      if (!fitsSomeSlot) continue;

      const studentId = resolveStudentId(program);
      // Create session
      const newSession = await Session.create({
        program: programId,
        programModel,
        student: studentId,
        teacher: program.teacher,
        duration,
        type: 'program',
        status: 'scheduled',
        scheduledAtDate: startDate,
        scheduledAt: [
          {
            day: pref.day,
            slots: [{ start: pref.start }],
          },
        ],
        meetingId: crypto.randomBytes(8).toString('hex'),
        meetingLink: program.meetingLink || null,
      });

      created.push(newSession);
      createdThisWeek++;

      console.log(
        `✅ Created session #${created.length}/${totalSessions} on week ${w} → ${pref.day} at ${pref.start}`
      );
    }
  }

  console.log(`✅ FINISHED → ${created.length}/${totalSessions} sessions created`);

  return created;
}

exports.assignTeacherToProgram = asyncHandler(async (req, res, next) => {
  const { id: programId } = req.params;
  const { teacherId } = req.body;

  if (!teacherId) return next(new ApiError('teacherId is required', 400));

  const result = await findProgramById(programId);
  if (!result) return next(new ApiError('Program not found', 404));

  const { program } = result;
  const programModel = program.constructor.modelName;

  const teacher = await User.findById(teacherId);
  if (!teacher || teacher.status !== 'active') {
    return next(new ApiError('Teacher not found or inactive', 404));
  }

  program.teacher = teacherId;
  await program.save();

  let trialSessionDoc = null;
  let hasTrial = false;

  const studentId = resolveStudentId(program);

  if (program.trialSession === true) {
    const existingTrial = await Session.findOne({ program: programId, type: 'trial' });

    if (!existingTrial) {
      const pref = program.preferredTimes[0];
      const startDate = computeNextDate(pref.day, pref.start);

      trialSessionDoc = await Session.create({
        program: programId,
        programModel,
        student: studentId,
        teacher: teacherId,
        type: 'trial',
        duration: 15,
        status: 'scheduled',
        scheduledAtDate: startDate,
        scheduledAt: [{ day: pref.day, slots: [{ start: pref.start }] }],
        meetingId: crypto.randomBytes(8).toString('hex'),
      });

      hasTrial = true;
    }
  }

  const existingProgramSessions = await Session.find({
    program: programId,
    type: 'program',
  });

  let createdSessions = [];

  if (existingProgramSessions.length === 0) {
    createdSessions = await generatePlanSessionsLogic(
      program,
      teacher,
      programModel,
      hasTrial // pass trial info
    );
  }

 await sendNotification(teacher, {
    title: 'New Program Assigned 🎉',
    body: `You have been assigned to a new program (${programModel}).`,
    data:{
      programId: program._id.toString(),
      type:'program'
    }
    })

  res.status(200).json({
    status: 'success',
    message: 'Teacher assigned successfully. Trial + plan sessions generated.',
    teacherId,
    trialSession: trialSessionDoc,
    createdSessionsCount: createdSessions.length,
    createdSessions,
  });
});
