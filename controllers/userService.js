const  {uploadAndAttachUrl}  = require('../middlewares/uploadImageMiddleware');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

exports.uploadUserImg = uploadAndAttachUrl('profile_picture');

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.getUser = factory.getOne(User);

exports.getAllUsers = factory.getAll(User);

exports.deleteUser = factory.deleteOne(User);
