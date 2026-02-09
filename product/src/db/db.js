const mongoose = require("mongoose");

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected products");
    }
    catch(err){
        console.log("MongoDB connection error in products ",err);

    }
}


module.exports = connectDB;