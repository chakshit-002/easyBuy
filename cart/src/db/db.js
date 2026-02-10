const mongoose = require("mongoose")

async function connectDB(){
    try{
        await  mongoose.connect(process.env.MONGO_URI)
        console.log("Database is connected")
    }catch(err){
        console.log("Error connection to the data base ",err)
    }
}

module.exports = connectDB