const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { body, validationResult } = require('express-validator');

//Register a User
exports.registerUser = [
    body('name').escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 5 }).trim().escape(),

    catchAsyncError(async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ErrorHandler('Validation error', 422, errors.array()));
        }

        const { name, email, password } = req.body;

        const user = await User.create({
            name, email, password
        });

        sendToken(user, 201, res);
    })
];

//Login User
exports.loginUser = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 5 }).trim().escape(),
    catchAsyncError(async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ErrorHandler('Validation error', 422, errors.array()));
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Please enter Email and Password", 400));
        }
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Email or Password", 401));
        }

        sendToken(user, 200, res);

    })
];


//Logout User
exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        message: "Logged Out successfully"
    })

})

//Forgot Password
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    //Get reset Password token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPassUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is: \n\n ${resetPassUrl} \n\nIf you have not requested any changes then please ignore`

    try {

        await sendEmail({
            email: user.email,
            subject: "BookCafe password recovery token",
            message,
        });

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        });

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new ErrorHandler(error.message, 500));
    }
});


//Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return next(new ErrorHandler("Reset token is invalid or has been expired", 400));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);

});

//Get User Details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    });

});

//Update Passwod
exports.updatePassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatch = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid Email or Password", 401));
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password doesn't match", 400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user, 200, res);

});

//Update Profile
exports.updateProfile = catchAsyncError(async (req, res, next) => {

    const newUser = {
        name: req.body.name,
        email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user._id, newUser, {
        new: true,
        runValidators: true,
        useFindAndMOdify: false
    });

    res.status(200).json({
        success: true
    });

});