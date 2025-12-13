const asyncHandler = require('express-async-handler');
const Session = require('../models/sessionModel');
const User = require('../models/userModel');
const { ensureProgramMeetingId } = require('../utils/meeting');
const ApiError = require('../utils/apiError');
const MemorizationProgram = require('../models/memorizationProgramModel');
const CorrectionProgram = require('../models/correctionProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const ProgramType = require('../models/programTypeModel');
const crypto = require('crypto');
const sendNotification = require('../utils/sendNotification');

// const checkOverLap = asyncHandler(async ({ teacherId, start, duration }) => {
//   //session times
//   const startDate = new Date(start);
//   const endDate = new Date(startDate.getTime() + duration * 60000);

//   console.log(`🔍 Checking overlap for teacher ${teacherId}`);
//   console.log(`   Session: ${startDate.toISOString()} to ${endDate.toISOString()}`);

//   const conflict = await Session.findOne({
//     teacher: teacherId,
//     status: { $in: ['pending', 'scheduled'] },
//     $or: [
//       {
//         scheduledAtDate: { $gte: startDate, $lt: endDate },
//       },
//       {
//         scheduledAtDate: { $lte: startDate },
//         $expr: {
//           $gt: [{ $add: ['$scheduledAtDate', { $multiply: ['$duration', 60000] }] }, startDate],
//         },
//       },
//     ],
//   }).lean();

//   if (conflict) {
//     console.log(`   ⚠️  Conflict found with session:`, conflict._id);
//   } else {
//     console.log(`   ✅ No conflicts found`);
//   }

//   return !!conflict;
// });

const checkOverLap = asyncHandler(async ({ teacherId, start, duration }) => {
  //session times
  const startDate = new Date(start);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  console.log(`🔍 Checking overlap for teacher ${teacherId}`);
  console.log(`   Session: ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const conflict = await Session.findOne({
    teacher: teacherId,
    status: { $in: ['pending', 'scheduled'] },
    $or: [
      {
        scheduledAtDate: { $gte: startDate, $lt: endDate },
      },
      {
        scheduledAtDate: { $lte: startDate },
        $expr: {
          $gt: [{ $add: ['$scheduledAtDate', { $multiply: ['$duration', 60000] }] }, startDate],
        },
      },
    ],
  }).lean();

  if (conflict) {
    console.log(`   ⚠️  Conflict found with session:`, conflict._id);
  } else {
    console.log(`   ✅ No conflicts found`);
  }

  return !!conflict;
});

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}
// function removeBookedTimeFromSlots(dayRecord, bookingStart, bookingEnd) {
//   const updatedSlots = [];
//   for (const slot of dayRecord.slots) {
//     const [sH, sM] = slot.start.split(':').map(Number);
//     const [eH, eM] = slot.end.split(':').map(Number);

//     const ref = new Date(bookingStart);
//     const slotStart = new Date(ref);
//     slotStart.setHours(sH, sM, 0, 0);
//     const slotEnd = new Date(ref);
//     slotEnd.setHours(eH, eM, 0, 0);

//     if (bookingEnd <= slotStart || bookingStart >= slotEnd) {
//       updatedSlots.push(slot);
//       continue;
//     }

//     if (bookingStart > slotStart) {
//       updatedSlots.push({
//         start: slot.start,
//         end: formatTime(bookingStart),
//       });
//     }

//     if (bookingEnd < slotEnd) {
//       updatedSlots.push({
//         start: formatTime(bookingEnd),
//         end: slot.end,
//       });
//     }
//   }

//   dayRecord.slots = updatedSlots;
// }

// Utility: get next date for weekday (no ISO format needed)

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
function nextDateForDay(day, addDays = 0) {
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
  const targetDay = map[day];
  const diff = (targetDay + 7 - today.getDay()) % 7;

  const result = new Date(today);
  result.setDate(today.getDate() + diff + addDays);

  return result;
}

// Helper function to generate plan sessions (can be called from route or directly)
// async function generatePlanSessionsLogic(program, teacher, programModel) {
//   const schedule = teacher?.teacherProfile?.availabilitySchedule || [];

//   const weeklySessions = program.weeklySessions;
//   const duration = program.sessionDuration;
//   const weeks = program.packageDuration * 4;
//   const totalSessions = weeklySessions * weeks;
//   const programId = program._id;

//   // NORMALIZE preferred times for each program type
//   let preferred = [];

//   if (programModel === 'CorrectionProgram') {
//     // Correction program has NO day/start in preferredTimes
//     // → Use program.days + teacher's earliest slot
//     if (!program.preferredTimes || !Array.isArray(program.preferredTimes)) {
//       throw new ApiError('Program must have preferred times specified', 400);
//     }

//     if (!schedule || schedule.length === 0) {
//       throw new ApiError(
//         `Teacher has no availability schedule set. Please configure teacher availability for days: [${program.days.join(', ')}] before generating sessions.`,
//         400
//       );
//     }

//     const availableDays = schedule.map((d) => d.day);
//     console.log(`📅 CorrectionProgram requires days: [${program.days.join(', ')}]`);
//     console.log(`📅 Teacher has availability for: [${availableDays.join(', ')}]`);

//     preferred = program.days
//       .map((day) => {
//         const rec = schedule.find(
//           (d) => d.day && d.day.toLowerCase() === String(day).toLowerCase()
//         );
//         if (!rec || !rec.slots || rec.slots.length === 0) {
//           console.log(`  ❌ No availability found for day: "${day}"`);
//           return null;
//         }
//         console.log(`  ✅ Found availability for "${day}" at ${rec.slots[0].start}`);

//         return {
//           day,
//           start: rec.slots[0].start, // earliest available teacher time
//         };
//       })
//       .filter(Boolean);
//   } else if (
//     programModel === 'MemorizationProgram' ||
//     programModel === 'ChildMemorizationProgram'
//   ) {
//     if (!program.preferredTimes || !Array.isArray(program.preferredTimes)) {
//       throw new ApiError('Program must have preferred times specified', 400);
//     }

//     const availableDays = schedule.map((d) => d.day);
//     console.log(
//       `📅 ${programModel} requires days: [${program.preferredTimes.map((p) => p.day).join(', ')}]`
//     );
//     console.log(`📅 Teacher has availability for: [${availableDays.join(', ')}]`);

//     // Validate that preferredTimes have both day and start, and match teacher's available days
//     preferred = program.preferredTimes
//       .filter((t) => t?.day && t?.start)
//       .map((t) => {
//         const rec = schedule.find(
//           (d) => d.day && d.day.toLowerCase() === String(t.day).toLowerCase()
//         );
//         if (!rec || !rec.slots || rec.slots.length === 0) {
//           console.log(`  ❌ No availability found for "${t.day}" at "${t.start}"`);
//           return null;
//         }
//         console.log(`  ✅ Found availability for "${t.day}"`);
//         return t;
//       })
//       .filter(Boolean);
//   }

//   if (!preferred.length) {
//     const availableDays = schedule.map((d) => d.day).join(', ') || 'NONE';
//     let errorMsg =
//       'No valid preferred times to generate sessions. Program requires days/times that teacher is not available for.';

//     if (programModel === 'CorrectionProgram') {
//       errorMsg = `CorrectionProgram requires days [${program.days.join(', ')}] but teacher only has availability on [${availableDays}].`;
//     } else {
//       const requiredDays = program.preferredTimes.map((p) => `${p.day}(${p.start})`).join(', ');
//       errorMsg = `${programModel} requires [${requiredDays}] but teacher only has availability on [${availableDays}].`;
//     }

//     throw new ApiError(errorMsg, 400);
//   }

//   // Helper to compute date of a specific weekday + time + week offset
//   const computeDate = (day, time, weekOffset) => {
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
//     d.setDate(today.getDate() + diff + weekOffset * 7);

//     const [h, m] = time.split(':').map(Number);
//     d.setHours(h, m, 0, 0);

//     return d;
//   };

//   const created = [];
//   let count = 0;

//   // Make a deep copy of schedule to modify it
//   const scheduleSnapshot = JSON.parse(JSON.stringify(schedule));

//   for (let w = 0; w < weeks && count < totalSessions; w++) {
//     let createdThisWeek = 0;

//     for (const pref of preferred) {
//       if (count >= totalSessions) break;

//       // Use the snapshot instead of original schedule
//       const dayRecord = scheduleSnapshot.find(
//         (d) => d.day && d.day.toLowerCase() === String(pref.day).toLowerCase()
//       );

//       if (!dayRecord || !dayRecord.slots?.length) {
//         console.log(`  ⚠️  Week ${w + 1}: Day "${pref.day}" has no slots available, skipping`);
//         continue;
//       }

//       const startDate = computeDate(pref.day, pref.start, w);
//       const endDate = new Date(startDate.getTime() + duration * 60000);

//       console.log(`  🔍 Week ${w + 1}: Checking ${pref.day} at ${pref.start}`);
//       console.log(`    Start: ${startDate.toISOString()}, End: ${endDate.toISOString()}`);
//       console.log(`    Available slots: ${JSON.stringify(dayRecord.slots)}`);

//       // find slot that contains that time
//       const slot = dayRecord.slots.find((s) => {
//         const [hs, ms] = s.start.split(':').map(Number);
//         const [he, me] = s.end.split(':').map(Number);

//         const ref = new Date(startDate);
//         const slotStart = new Date(ref);
//         slotStart.setHours(hs, ms, 0, 0);
//         const slotEnd = new Date(ref);
//         slotEnd.setHours(he, me, 0, 0);

//         const fits = slotStart <= startDate && slotEnd >= endDate;
//         console.log(
//           `    Checking slot ${s.start}-${s.end}: slotStart=${slotStart.toISOString()}, slotEnd=${slotEnd.toISOString()}, fits=${fits}`
//         );
//         return fits;
//       });

//       if (!slot) {
//         console.log(`    ❌ No suitable slot found for ${pref.day} at ${pref.start}, skipping`);
//         continue;
//       }

//       console.log(`    ✅ Creating session for ${pref.day} at ${pref.start}`);

//       // CREATE session
//       const newSession = await Session.create({
//         program: programId,
//         programModel,
//         student: program.student,
//         teacher: program.teacher,
//         duration,
//         type: 'program',
//         status: 'scheduled',
//         scheduledAtDate: new Date(startDate),
//         scheduledAt: [{ day: pref.day, slots: [{ start: pref.start }] }],
//       });

//       created.push(newSession);
//       count++;
//       createdThisWeek++;

//       console.log(`    ✨ Session created! Total so far: ${count}/${totalSessions}`);

//       // ✨ REMOVE BOOKED TIME FROM TEACHER'S AVAILABILITY
//       removeBookedTimeFromSlots(dayRecord, startDate, endDate);
//       console.log(
//         `    ✅ Removed booked time from teacher's availability. Remaining slots: ${JSON.stringify(dayRecord.slots)}`
//       );

//       if (createdThisWeek >= weeklySessions) {
//         console.log(`  ✨ Week ${w + 1} complete: ${createdThisWeek} sessions created`);
//         break;
//       }
//     }
//   }

//   // ✨ PERSIST UPDATED SCHEDULE TO DATABASE
//   teacher.teacherProfile.availabilitySchedule = scheduleSnapshot;
//   await teacher.save();
//   console.log(`✅ Teacher availability updated and saved to database`);

//   return created;
// }

async function generatePlanSessionsLogic(program, teacher, programModel) {
  const schedule = teacher?.teacherProfile?.availabilitySchedule || [];

  const weeklySessions = program.weeklySessions;
  const duration = program.sessionDuration;
  const weeks = program.packageDuration * 4;
  const totalSessions = weeklySessions * weeks;
  const programId = program._id;

  // NORMALIZE preferred times for each program type
  let preferred = [];

  if (programModel === 'CorrectionProgram') {
    if (!program.preferredTimes || !Array.isArray(program.preferredTimes)) {
      throw new ApiError('Correction Program must have preferredTimes specified', 400);
    }

    const availableDays = schedule.map((d) => d.day);
    // Correction program: use preferredTimes if available, else use days + teacher's first slot

    preferred = program.preferredTimes
      .filter((t) => t?.day && t?.start)
      .map((t) => {
        const rec = schedule.find(
          (d) => d.day && d.day.toLowerCase() === String(t.day).toLowerCase()
        );

        if (!rec || !rec.slots || rec.slots.length === 0) {
          console.log(`❌ No slot matches ${t.day} @ ${t.start}`);
          return null;
        }

        console.log(`✅ Using preferred time ${t.day}@${t.start}`);
        return t;
      })
      .filter(Boolean);
  } else if (
    programModel === 'MemorizationProgram' ||
    programModel === 'ChildMemorizationProgram'
  ) {
    if (!program.preferredTimes || !Array.isArray(program.preferredTimes)) {
      throw new ApiError('Program must have preferred times specified', 400);
    }

    const availableDays = schedule.map((d) => d.day);
    console.log(
      `📅 ${programModel} requires days: [${program.preferredTimes.map((p) => p.day).join(', ')}]`
    );
    console.log(`📅 Teacher has availability for: [${availableDays.join(', ')}]`);

    // Validate that preferredTimes have both day and start, and match teacher's available days
    preferred = program.preferredTimes
      .filter((t) => t?.day && t?.start)
      .map((t) => {
        const rec = schedule.find(
          (d) => d.day && d.day.toLowerCase() === String(t.day).toLowerCase()
        );
        if (!rec || !rec.slots || rec.slots.length === 0) {
          console.log(`  ❌ No availability found for "${t.day}" at "${t.start}"`);
          return null;
        }
        console.log(`  ✅ Found availability for "${t.day}"`);
        return t;
      })
      .filter(Boolean);
  }

  if (!preferred.length) {
    const availableDays = schedule.map((d) => d.day).join(', ') || 'NONE';
    throw new ApiError(
      `${programModel} has no valid preferred times matching teacher availability. ` +
        `Required: [${program.preferredTimes
          .map((p) => `${p.day}@${p.start}`)
          .join(', ')}], Teacher available: [${availableDays}]`,
      400
    );
  }

  // Helper to compute date of a specific weekday + time + week offset
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
    const target = map[day.toLowerCase()];
    const diff = (target + 7 - today.getDay()) % 7;

    const d = new Date(today);
    d.setDate(today.getDate() + diff + weekOffset * 7);

    const [h, m] = time.split(':').map(Number);
    d.setHours(h, m, 0, 0);

    return d;
  };

  const created = [];
  let count = 0;

  // Make a deep copy of schedule to modify it
  const scheduleSnapshot = JSON.parse(JSON.stringify(schedule));

  console.log(
    `📊 Plan: Create ${totalSessions} total sessions (${weeklySessions}/week for ${weeks} weeks)`
  );
  console.log(`📊 Preferred times/days available:`, preferred);

  for (let w = 0; w < weeks && count < totalSessions; w++) {
    let createdThisWeek = 0;
    for (const pref of preferred) {
      // Use the snapshot instead of original schedule
      const dayRecord = scheduleSnapshot.find(
        (d) => d.day && d.day.toLowerCase() === String(pref.day).toLowerCase()
      );
      if (!dayRecord || !dayRecord.slots?.length) continue;

      // Iterate through all slots for this day in this week
      for (const slot of [...dayRecord.slots]) {
        if (createdThisWeek >= weeklySessions || count >= totalSessions) break;

        const startDate = computeDate(pref.day, slot.start, w);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        // Check if session fits in slot
        const [hs, ms] = slot.start.split(':').map(Number);
        const [he, me] = slot.end.split(':').map(Number);
        const slotStart = new Date(startDate);
        slotStart.setHours(hs, ms, 0, 0);
        const slotEnd = new Date(startDate);
        slotEnd.setHours(he, me, 0, 0);

        const fits =
          slotStart.getTime() <= startDate.getTime() && slotEnd.getTime() >= endDate.getTime();
        if (!fits) continue;

        // CREATE session with unique meetingId
        const newSession = await Session.create({
          program: programId,
          programModel,
          student: program.student || program.parent,
          teacher: program.teacher,
          duration,
          type: 'program',
          status: 'scheduled',
          scheduledAtDate: new Date(startDate),
          scheduledAt: [{ day: pref.day, slots: [{ start: slot.start }] }],
          meetingId: crypto.randomBytes(8).toString('hex'),
          meetingLink: program.meetingLink || null,
        });

        created.push(newSession);
        count++;
        createdThisWeek++;

        // Remove booked time from teacher's availability
        removeBookedTimeFromSlots(dayRecord, startDate, endDate);

        // Break if weekly session limit reached
        if (createdThisWeek >= weeklySessions) break;
      }
    }
  }

  // ✨ PERSIST UPDATED SCHEDULE TO DATABASE
  teacher.teacherProfile.availabilitySchedule = scheduleSnapshot;
  await teacher.save();
  console.log(`✅ Teacher availability updated and saved to database`);

  return created;
}

// Direct function export for programServices to call
exports.generatePlanSessionsForProgram = asyncHandler(async (program, teacher) => {
  // Determine program model based on constructor or custom field
  let programModel = 'MemorizationProgram';
  if (program.goal) {
    programModel = 'CorrectionProgram';
  } else if (program.childName) {
    programModel = 'ChildMemorizationProgram';
  }

  return generatePlanSessionsLogic(program, teacher, programModel);
});

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

//   try {
//     // Call the core logic which validates and creates sessions
//     const created = await generatePlanSessionsLogic(program, teacher, programModel);

//     return res.status(201).json({
//       status: 'success',
//       totalCreated: created.length,
//       sessions: created,
//     });
//   } catch (error) {
//     return next(error);
//   }
// });

exports.generatePlanSessions = asyncHandler(async (req, res, next) => {
  const { programModel } = req.body;
  const programId = req.params.id;

  const ProgramModel = {
    CorrectionProgram,
    MemorizationProgram,
    ChildMemorizationProgram,
  }[programModel];

  if (!ProgramModel) return next(new ApiError('Program not found', 404));
  const program = await ProgramModel.findById(programId);
  if (!program) return next(new ApiError('Program not found', 404));

  const teacher = await User.findById(program.teacher);
  if (!teacher) return next(new ApiError('Teacher not found', 404));

  // ✨ VALIDATION: Check if teacher is dedicated to this program type
  const teacherPreferences = teacher.teacherProfile?.programPreference || [];
  const programType = await ProgramType.findOne({ key: programModel });

  if (programType && teacherPreferences.length > 0) {
    const isDedicatedToProgram = teacherPreferences.some(
      (pref) => pref._id.toString() === programType._id.toString()
    );

    if (!isDedicatedToProgram) {
      return next(
        new ApiError(
          `Teacher is not dedicated to ${programModel}. Teacher specializes in: ${teacherPreferences.join(', ')}`,
          403
        )
      );
    }
  }

  // Call the core logic which validates and creates sessions
  const created = await generatePlanSessionsLogic(program, teacher, programModel);

  return res.status(201).json({
    status: 'success',
    totalCreated: created.length,
    sessions: created,
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
      meetingId: crypto.randomBytes(8).toString('hex'), // <— UNIQUE TRIAL ID
    });
    return trial;
  }
);

// exports.bookProgramSession = asyncHandler(async (req, res, next) => {
//   const { programId, programModel, teacherId, scheduledAt, scheduledAtDate } = req.body;
//   const ProgramModel = {
//     CorrectionProgram,
//     MemorizationProgram,
//     ChildMemorizationProgram,
//   }[programModel];

//   if (!ProgramModel) return next(new ApiError('Program not found', 404));
//   // 2️⃣ Validate program
//   const program = await ProgramModel.findById(programId);
//   if (!program) return next(new ApiError('Program not found', 404));

//   // const studentId = req.user._id;
//   const teacher = await User.findById(teacherId);
//   if (!teacher || teacher.status !== 'active') {
//     return next(new ApiError('Selected teacher is not available', 403));
//   }
//   const schedule = teacher.teacherProfile.availabilitySchedule || [];

//   console.log(`📅 Looking for day: ${scheduledAt.day}`);
//   console.log(
//     `📅 Available days in schedule:`,
//     schedule.map((s) => s.day)
//   );

//   // 3) Get day record
//   const dayRecord = schedule.find(
//     (d) => d.day && d.day.toLowerCase() === scheduledAt.day.toLowerCase()
//   );

//   if (!dayRecord) {
//     return next(new ApiError('Teacher not available on this day', 400));
//   }

//   console.log(`📅 Found day record for ${scheduledAt.day}`);
//   console.log(`📅 Available slots:`, dayRecord.slots);

//   // 4) Find slot - check if the requested time falls within any slot's range
//   const slot = dayRecord.slots.find((s) => {
//     const [reqH, reqM] = scheduledAt.start.split(':').map(Number);
//     const [slotH, slotM] = s.start.split(':').map(Number);
//     const [slotEndH, slotEndM] = s.end.split(':').map(Number);

//     const reqTime = reqH * 60 + reqM;
//     const slotStart = slotH * 60 + slotM;
//     const slotEnd = slotEndH * 60 + slotEndM;

//     const fits = reqTime >= slotStart && reqTime < slotEnd;
//     console.log(
//       `    Checking slot ${s.start}-${s.end}: reqTime=${reqTime}, slotStart=${slotStart}, slotEnd=${slotEnd}, fits=${fits}`
//     );
//     return fits;
//   });

//   if (!slot) {
//     console.log(`❌ No suitable slot found for ${scheduledAt.start}`);
//     return next(new ApiError('Selected time slot is not available', 400));
//   }

//   console.log(`✅ Found suitable slot: ${slot.start}-${slot.end}`);

//   // 4.5) Check for scheduling conflicts using checkOverLap
//   // Parse the scheduled date from request or compute it from day name
//   let sessionDate;
//   if (scheduledAtDate) {
//     sessionDate = new Date(scheduledAtDate);
//   } else {
//     // Fallback: compute from day name (less reliable)
//     const [hours, minutes] = scheduledAt.start.split(':').map(Number);
//     sessionDate = new Date();
//     const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
//     const dayIndex = days.indexOf(scheduledAt.day.toLowerCase());
//     const currentDay = sessionDate.getDay();
//     const diff = (dayIndex - currentDay + 7) % 7;
//     sessionDate.setDate(sessionDate.getDate() + diff);
//     sessionDate.setHours(hours, minutes, 0, 0);
//   }

//   const hasConflict = await checkOverLap({
//     teacherId,
//     start: sessionDate.toISOString(),
//     duration: program.sessionDuration,
//   });

//   if (hasConflict) {
//     return next(new ApiError('Teacher already has a session at this time', 400));
//   }

//   await ensureProgramMeetingId(program);
//   // 5) Build correct session payload (matches your Session model)
//   const sessionPayload = {
//     program: programId,
//     programModel,
//     student: req.user._id,
//     teacher: teacherId,
//     duration: program.sessionDuration,
//     status: 'scheduled',
//     type: 'program',
//     scheduledAtDate: sessionDate,
//     scheduledAt: [
//       {
//         day: scheduledAt.day,
//         slots: [
//           { start: scheduledAt.start }, // your session model only has start
//         ],
//       },
//     ],
//     meetingId: program.meetingId,
//     meetingLink: program.meetingLink || null,
//   };

//   const session = await Session.create(sessionPayload);

//   // 6) Remove booked time from teacher availability using proper time fragmentation
//   const endDate = new Date(sessionDate.getTime() + program.sessionDuration * 60000);
//   removeBookedTimeFromSlots(dayRecord, sessionDate, endDate);
//   await teacher.save();

//   return res.status(201).json({
//     status: 'success',
//     message: 'Session booked successfully',
//     session,
//   });
// });

// exports.trialSessionAccept = asyncHandler(async (req, res, next) => {
//   const { scheduledAt, meetingLink } = req.body;

//   const trial = await Session.findById(req.params.id);
//   if (!trial) return next(new ApiError('Trial not found'));
//   if (trial.type !== 'trial') {
//     return next(new ApiError('This session is not a trial session', 400));
//   }
//   if (trial.teacher.toString() !== req.user._id.toString()) {
//     return next(new ApiError('You are not authorized to schedule this trial', 403));
//   }
//   const dateObj = new Date(scheduledAt);
//   if (isNaN(dateObj)) {
//     return next(new ApiError('Invalid date format', 400));
//   }

//   //trial.scheduledAt = new Date(scheduledAt);

//   const conflict = await checkOverLap({
//     teacherId: trial.teacher,
//     start: dateObj.toISOString(),
//     duration: trial.duration,
//   });

//   if (conflict) {
//     return next(new ApiError('Teacher has session at the same time', 400));
//   }

//   trial.scheduledAt = dateObj;
//   // Step 3 — Convert to structured scheduledAt
//   const dayName = dateObj.toLocaleString('en-US', { weekday: 'long' }).toLowerCase(); // monday, tuesday...

//   const startTime = dateObj.toISOString().slice(11, 16); // "17:00"

//   trial.scheduledAt = [
//     {
//       day: dayName,
//       slots: [{ start: startTime }],
//     },
//   ];

//   trial.meetingLink = meetingLink;
//   trial.status = 'scheduled';

//   await trial.save();

//   res.status(200).json({
//     status: 'success',
//     message: 'Trial session confirmed',
//     data: trial,
//   });
// });

exports.sessionCompleted = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.id;
  const { notification } = req.body;
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

  
  if (notification) {
    const student = await User.findById(session.student);
    await sendToUser(teacher, notification);
    await sendToUser(student, notification);
  }

  res.status(200).json({
    status: 'success',
    message: 'Session marked as completed',
    data: session,
  });
});

exports.sessionStart = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.id;
  const { notification } = req.body;
  const session = await Session.findByIdAndUpdate(
    { _id: sessionId },
    {
      status: 'started',
      startedAt: new Date(),
    },
    { new: true }
  );

  if (notification) {
    const teacher = await User.findById(session.teacher);
    const student = await User.findById(session.student);
    await sendToUser(teacher, notification);
    await sendToUser(student, notification);
  }
  res.status(200).json({
    status: 'success',
    message: 'Session has started',
    data: session,
  });
});
