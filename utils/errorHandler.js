class ErrorHandler extends Error{ //Error is the pre-defined class of NodeJs
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode

        Error.captureStackTrace(this, this.constructor)
    }
}

module.exports = ErrorHandler