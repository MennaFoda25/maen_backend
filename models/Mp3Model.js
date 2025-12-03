const mongoose = require('mongoose')

const mp3Schema = new mongoose.Schema({
    name: {type:String,requirred:true, unique:true , trim:true},
    description:{type:String , default:""},

    fileUrl: { type: String}, // Cloudinary URL
},{timestamps:true})

module.exports = mongoose.model("Mp3File", mp3Schema);
