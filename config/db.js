const mongoose = require('mongoose');
require('dotenv').config();

function connectDB() {
    // db connection
    mongoose.connect(process.env.MONGO_CONNECTION_URL,
        { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .then(() => {
            console.log("DB CONNECTED");
        })
        .catch(
            (e) => {
                console.log("DB NOT CONNECTED!!");
            }
        )
}

module.exports = connectDB;