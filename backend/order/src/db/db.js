const mongoose = require('mongoose')

async function connectDB() {


    try {
        if (process.env.NODE_ENV !== 'test') {
            mongoose.connect(process.env.MONGO_URI);
            console.log("Database Connected Successfully")
        }
        // await mongoose.connect(process.env.MONGO_URI)
    }
    catch (err) {
        console.log("Error connecting to MONGODB", err)
    }
}


module.exports = connectDB;