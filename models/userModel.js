const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [30, "Name exceeded 30 characters"],
        minLength: [4, "Please enter the name with a minimum of 4 characters"]
    },

    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid email"]
    },

    password: {
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Please enter the password with a minimum of 8 characters"],
        select: false // to avoid accessing it during find()
    },

    createdAt:{
        type: Date,
        default: Date.now
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date
});


userSchema.pre("save", async function(next){

    if(!this.isModified("password")){
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);

});


//JWT --> cookie setting
userSchema.methods.getJWTtoken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE,
    });
}

//Compare Password
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
}

//Reset Password token
userSchema.methods.getResetPasswordToken = function() {
    //Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");

    //Hashing and adding resetPasswordToken to UserSchema
    this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken; //we have not passed the hashed token
};


module.exports = mongoose.model("User", userSchema);