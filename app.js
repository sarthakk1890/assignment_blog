const express = require('express');
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const dotenv = require("dotenv")
const cors = require('cors');

const app = express();
dotenv.config();

// Rate Limiting Middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api', limiter);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

const userRoute = require("./route/userRoute");
const blogRoute = require("./route/blogRoute");


app.use("/api/v1", userRoute);
app.use("/api/v1", blogRoute);

//Error Middleware
app.use(errorMiddleware);

module.exports = app;
