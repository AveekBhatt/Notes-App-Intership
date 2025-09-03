const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    content : {
        type : String , 
        required : true
    },
    tags : {
        type : [String],
        default :[]
    },
    summary : {
        type : String , 
        required : true
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: { type: Date, default: Date.now } ,
    updatedAt : {
        type : Date,
        default : Date.now
    },
    updatedBy : {
        type : String ,
        default : "You"
    }
}) 
module.exports = mongoose.model("Note" , noteSchema);