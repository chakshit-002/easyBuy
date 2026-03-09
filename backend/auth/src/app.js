const express = require('express')
const cookieParser = require('cookie-parser')
const  authRoute = require('./routes/auth.route')

const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cookieParser());


// Backend Service mein 
app.use(cors({
    origin: 'http://localhost:5173', //  React URL
    credentials: true
}));


//health check route 
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Auth Service is running"
    })
})


app.use('/api/auth',authRoute)

module.exports = app;