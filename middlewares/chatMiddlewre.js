const CorrectionProgram = require('../models/correctionProgramModel');
const MemorizationProgram = require('../models/memorizationProgramModel');
const ChildMemorizationProgram = require('../models/childMemoProgramModel');
const ApiError = require('../utils/apiError');

async function areUsersAssigned(userA, userB) {
  if (!userA || !userB) return false;

  const condA = { student: userA, teacher: userB };
  const condB = { student: userB, teacher: userA };

  const checks = await Promise.all([
    CorrectionProgram.exists({ $or: [condA, condB] }),
    MemorizationProgram.exists({ $or: [condA, condB] }),
    ChildMemorizationProgram.exists({ $or: [condA, condB] }),
  ]);
  return checks.some(Boolean);
}

/**
 * Express middleware to ensure the current user can chat with `receiverId`.
 * Reads receiverId from req.body.receiverId by default;
 */

function ensureAssigned(options = {}) {
  const receiverField = options.receiverField || "receiverId";

  return async function (req, res, next) {
    try {
      const senderId = req.user?._id;
      const receiverId =
        req.body?.[receiverField] ||
        req.query?.[receiverField];

      if (!receiverId) {
        return next(new ApiError(`${receiverField} is required`, 400));
      }

      const assigned = await areUsersAssigned(
        senderId.toString(),
        receiverId.toString()
      );

      if (!assigned) {
        return next(
          new ApiError("You are not assigned/connected with this user", 403)
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { areUsersAssigned, ensureAssigned };