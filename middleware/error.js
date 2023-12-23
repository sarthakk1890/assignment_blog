const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal SErver Error";

    //handling MongoDb Cast error like exceeding ID limit
    if (err.name === "CastError") {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //MongoDb duplicate key error
    if(err.code == 11000){
        const message = `User with ${Object.keys(err.keyValue)} already exits`
        err = new ErrorHandler(message, 400);
    }
    
    //JWT error
    if(err.name == "JsonWebTokenError"){
        const message = `JWT is invalid, try again`
        err = new ErrorHandler(message, 400);
    }
    
    //JWT expire error
    if(err.name == "TokenExpiredError"){
        const message = `JWT is expired, try again`
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};