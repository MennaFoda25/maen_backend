const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) => 
  asyncHandler(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({ data: document });
  });


exports.updateOne = (Model) => 
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(new ApiError(`No document for this Id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });


exports.getAll = (Model) => 
  asyncHandler(async (req, res, next) => {
    const documentsCounts = await Model.countDocuments();

    const apiFeatures = new ApiFeatures(Model.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate(documentsCounts);

    const { mongooseQuery, paginateResult } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({ results: documents.length, paginateResult, data: documents });
  });


exports.getOne = (Model) => 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findById(id);

    if (!document) {
      return next(new ApiError(`No document for this Id: ${id} `));
    }
    res.status(200).json({ data: document });
  });


exports.deleteOne = (Model) => 
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this Id ${id}`, 404));
    }
    res.status(204).send();
  });

