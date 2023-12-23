const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Mongo_URL = process.env.MONGO_URL;

const connectDatabase = () => {
    mongoose
        .connect(Mongo_URL)
        .then((data) => {
            console.log(`MongoDB connected with server: ${data.connection.host}`);
        })
};

module.exports = connectDatabase;
