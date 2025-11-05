const CorrectionProgram = require("../models/correctionProgram")
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');

exports.assignAudio= asyncHandler (async(req,res)=>{
    const {programId} = req.params
    const {surahIndex, audioUrl} = req.body

    const program = await CorrectionProgram.findById(programId)

    if(!program){
        return next(new ApiError("now program with this ID", 404))
    }

    if(existing){
        existing.audioUrl = audioUrl
    } else{
        program.audioReferences.push({ surahIndex, audioUrl})
    }

    await program.save()
    res.status(200).json({
        status:'success',
        message: 'Audio URL assigned successfully',
        audioReferences: program.audioReferences
    })
})
