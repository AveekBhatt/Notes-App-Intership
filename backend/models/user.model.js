
const bcrypt = require("bcrypt");
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullname : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    createdOn : {
        type : Date , default : new Date().getTime()
    },
})
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); 
    try {
        const salt = await bcrypt.genSalt(10); 
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Optional: method to compare password during login
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model("User", userSchema);