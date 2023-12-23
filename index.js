const app = require('./app');
const connectDatabase = require("./config/db");

//Handling Uncaught Exception
process.on("uncaughtException", err => {
    console.log(`Error ${err.essage}`);
    console.log("Shutting down the server due to Uncaught Exception");
    process.exit(1);
});

//Connecting DataBase
connectDatabase();

app.get('/', (req, res, next) => {
    res.send('<h1>Hi I am working</h1>');
});

const server = app.listen(process.env.PORT || 4000, () => {
    console.log(
        `Server is working on http://localhost:${process.env.PORT || 4000}`
    );
});

//unhandled Promise rejection error
process.on("unhandledRejection", err => {
    console.log(`Error ${err.message}`);
    console.log("Shutting down the server due to unhandles promise rejection");
    server.close(() => {
        process.exit(1);
    });
});