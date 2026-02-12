const mongoose = require('mongoose')

async function connectDB(){


    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected Successfully")
    }
    catch(err){
        console.log("Error connecting to MONGODB",err)
    }
}


module.exports = connectDB;