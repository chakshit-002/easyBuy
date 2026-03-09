const express = require("express")
const {connect} = require('./broker/broker')
const setListeners = require("./broker/listeners")

const app = express();

connect().then(()=>{
    setListeners();
});
//rabbit mq do baar run ho rha tha toh ese likhege 

app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Notification Service is running"
    })
})



module.exports = app;