const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const asyncHandler = require('express-async-handler');
const ProgramType = require('../models/programTypeModel');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const crypto = require('crypto');


async function findProgramById(programId) {
  const models = {
    CorrectionProgram,
    MemorizationProgram,
    ChildMemorizationProgram,
  };

  for (const [modelName, Model] of Object.entries(models)) {
    const doc = await Model.findById(programId);
    if (doc) return { modelName, program: doc }; // 👈 modelName instead of "model"
  }
  return null;
}

exports.getAvailableTeachersByPreferredDays = asyncHandler(async (req, res, next) => {
  const programId = req.params.id;

  // 1️⃣ Find program (any type)
  const result = await findProgramById(programId);
  if (!result) return next(new ApiError('Program not found', 404));

  const { program } = result;

  if (!Array.isArray(program.preferredDays) || program.preferredDays.length === 0) {
    return next(new ApiError('Program has no preferredDays', 400));
  }

  const preferredDays = program.preferredDays.map((d) => d.toLowerCase());

  const programType = await ProgramType.findOne({ key: program.programTypeKey });

  // 2️⃣ Find active teachers
  let teachers = await User.find({
    role: 'teacher',
    status: 'active',
    'teacherProfile.programPreference': programType._id,
  })
    .select('name profile_picture teacherProfile.availabilitySchedule')
    .lean();

  // 3️⃣ Filter by days only
  teachers = teachers.filter((teacher) => {
    const teacherDays =
      teacher.teacherProfile?.availabilitySchedule?.map((d) => d.day.toLowerCase()) || [];

    // teacher must cover ALL preferred days
    return preferredDays.every((day) => teacherDays.includes(day));
  });

  // 4️⃣ Clean response
  const response = teachers.map((t) => ({
    _id: t._id,
    name: t.name,
    profile_picture: t.profile_picture,
  }));

  res.status(200).json({
    status: 'success',
    count: response.length,
    preferredDays,
    teachers: response,
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
    teacher: { $exists: true },
  };
  const memorizationPrograms = await MemorizationProgram.find({
    student: studentId,
    ...teacherFilter,
  }).select('-__v');
  const correctionPrograms = await CorrectionProgram.find({
    student: studentId,
    ...teacherFilter,
  }).select('-__v');
  const childPrograms = await ChildMemorizationProgram.find({ parent: studentId, ...teacherFilter }).select(
    '-__v'
  );

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
    (await ChildMemorizationProgram.findById(programId));

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
  else if (program.programTypeKey === 'ChildMemorizationProgram') Model = ChildMemorizationProgram;
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

/**
 * Assign teacher + reserve recurring slots + generate full plan
 */

exports.assignTeacherToProgram = asyncHandler(async (req, res, next) => {
  const { id: programId } = req.params;
  const { teacherId, reservedSlots } = req.body;

  if (!teacherId) throw new ApiError('teacherId is required', 400);
  if (!Array.isArray(reservedSlots) || !reservedSlots.length) {
    throw new ApiError('reservedSlots are required', 400);
  }

  // 1️⃣ Find program
  const result = await findProgramById(programId);
  //if (!result) throw new ApiError('Program not found', 404);

  const { program, modelName: programModel } = result;

  // 2️⃣ Load teacher
  const teacher = await User.findOne({
    _id: teacherId,
    role: 'teacher',
    status: 'active',
  }).lean();

  const availability = teacher.teacherProfile?.availabilitySchedule || [];

  // 3️⃣ Validate slots against availability
  for (const rs of reservedSlots) {
    const dayRecord = availability.find((d) => d.day === rs.day);
  
    const startMin = toMin(rs.start);
    const endMin = startMin + rs.duration;

    const fits = dayRecord.slots.some((slot) => {
      return startMin >= toMin(slot.start) && endMin <= toMin(slot.end);
    });

    if (!fits) {
      throw new ApiError(`Slot ${rs.day} ${rs.start} does not fit teacher availability`, 400);
    }
  }

  // 4️⃣ Check conflicts ONLY via reservedSlots (not sessions)
  const otherPrograms = await Promise.all([
    MemorizationProgram.find({ teacher: teacherId }).select('reservedSlots'),
    CorrectionProgram.find({ teacher: teacherId }).select('reservedSlots'),
    ChildMemorizationProgram.find({ teacher: teacherId }).select('reservedSlots'),
  ]);

  const alreadyReserved = otherPrograms.flat().flatMap((p) => p.reservedSlots || []);

  for (const rs of reservedSlots) {
    const startMin = toMin(rs.start);
    const endMin = startMin + rs.duration;

    const conflict = alreadyReserved.some(
      (r) =>
        r.day === rs.day && !(endMin <= toMin(r.start) || startMin >= toMin(r.start) + r.duration)
    );

    if (conflict) {
      throw new ApiError('One or more selected slots are already reserved', 409);
    }
  }

  // 5️⃣ Save reservation
  program.teacher = teacherId;
  program.reservedSlots = reservedSlots;
  await program.save();

  // 🔹 CREATE TRIAL SESSION (same slot, previous week)
let trialSession = null;

if (program.trialSession === true) {
  const firstSlot = reservedSlots[0];

  const trialDate = computeDate(
    firstSlot.day,
    firstSlot.start,
    0 // ✅ week 0
  );

  trialSession = await Session.create({
    program: program._id,
    programModel,
    student: resolveStudentId(program),
    teacher: teacherId,
    duration: firstSlot.duration,
    type: 'trial',
    status: 'scheduled',
    scheduledAtDate: trialDate,
    scheduledAt: [
      {
        day: firstSlot.day,
        slots: [{ start: firstSlot.start }],
      },
    ],
    meetingId: crypto.randomBytes(8).toString('hex'),
  });
}

if (reservedSlots.length !== program.weeklySessions) {
  throw new ApiError(
    `You must select exactly ${program.weeklySessions} slots per week`,
    400
  );
}

  // 6️⃣ Generate sessions
  const studentId = resolveStudentId(program);
  const weeks = program.packageDuration * 4;
  const totalSessions = program.weeklySessions * weeks;

  let created = 0;
  for (let w = 1; w <= weeks; w++) {
    for (const rs of reservedSlots) {
      if (created >= totalSessions) break;
      
      const startDate = computeDate(rs.day, rs.start, w);

      await Session.create({
        program: program._id,
        programModel,
        student: studentId,
        teacher: teacherId,
        duration: rs.duration,
        type: 'program',
        status: 'scheduled',
        scheduledAtDate: startDate,
        scheduledAt: [{ day: rs.day, slots: [{ start: rs.start }] }],
        meetingId: crypto.randomBytes(8).toString('hex'),
      });

      created++;
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Teacher assigned and slots reserved',
    trialSessionId: trialSession?._id || null,
    reservedSlots,
    totalSessions: created,
  });
});

function computeDate(day, time, weekOffset) {
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

  const date = new Date(today);
  date.setDate(today.getDate() + diff + weekOffset * 7);

  const [h, m] = time.split(':').map(Number);
  date.setHours(h, m, 0, 0);

  return date;
}

exports.getTeacherScheduleWithAvailability = asyncHandler(async (req, res, next) => {
  const teacherId = req.params.id;

  const teacher = await User.findOne({
    _id: teacherId,
    role: 'teacher',
    status: 'active',
  }).lean();

  if (!teacher) {
    return next(new ApiError('Teacher not found', 404));
  }

  const availability = teacher.teacherProfile?.availabilitySchedule || [];

  // 1️⃣ Load all programs with reserved slots
  const programs = await Promise.all([
    MemorizationProgram.find({ teacher: teacherId }).select('reservedSlots'),
    CorrectionProgram.find({ teacher: teacherId }).select('reservedSlots'),
    ChildMemorizationProgram.find({ teacher: teacherId }).select('reservedSlots'),
  ]);

  const reservedSlots = programs.flat().flatMap((p) => p.reservedSlots || []);

  // 2️⃣ Clone schedule to avoid mutation
  const availableSchedule = JSON.parse(JSON.stringify(availability));

  // 3️⃣ Subtract reserved slots
  for (const reserved of reservedSlots) {
    const dayRecord = availableSchedule.find((d) => d.day === reserved.day);
    if (!dayRecord) continue;

    const startMin = toMin(reserved.start);
    const endMin = startMin + reserved.duration;

    const updatedSlots = [];

    for (const slot of dayRecord.slots) {
      const slotStart = toMin(slot.start);
      const slotEnd = toMin(slot.end);

      // No overlap
      if (endMin <= slotStart || startMin >= slotEnd) {
        updatedSlots.push(slot);
        continue;
      }

      // Split slot if needed
      if (startMin > slotStart) {
        updatedSlots.push({
          start: slot.start,
          end: toTime(startMin),
        });
      }

      if (endMin < slotEnd) {
        updatedSlots.push({
          start: toTime(endMin),
          end: slot.end,
        });
      }
    }

    dayRecord.slots = updatedSlots;
  }

  res.status(200).json({
    status: 'success',
    data: availableSchedule,
  });
});

/* ===== helpers ===== */
function toMin(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function toTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
