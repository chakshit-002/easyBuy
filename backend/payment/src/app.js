const express = require('express');
const cookieParser = require('cookie-parser')
const paymentRoutes = require('./routes/payment.routes')
const cors = require('cors');
const app = express();
const allowedOrigins = [

    "http://localhost:5173",
    "https://easybuy-store.netlify.app"

];

app.use(express.json());
app.use(cookieParser());


app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

//ALB ko pta rhe ki konsa application chl rha hai ya nahi toh isliiye yh health check route create kiya 
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Payment Service is running"
    })
})


app.use('/api/payments',paymentRoutes)

module.exports = app;