const express = require('express');
const cookieParser = require('cookie-parser')
const paymentRoutes = require('./routes/payment.routes')

const app = express();

app.use(express.json());
app.use(cookieParser());

//ALB ko pta rhe ki konsa application chl rha hai ya nahi toh isliiye yh health check route create kiya 
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Payment Service is running"
    })
})

app.use('/api/payments',paymentRoutes)

module.exports = app;