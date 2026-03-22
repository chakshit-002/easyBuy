const express = require('express')
const cookieParser = require("cookie-parser")
const sellerRoutes =  require("./routes/seller.routes")
const  cors = require('cors');

const app = express();
const allowedOrigins = [

    "http://localhost:5173",
    "https://easybuy-store.netlify.app/"

];

app.use(express.json())
app.use(cookieParser())

//  Backend Service mein 
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));


app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Seller Dashboard Service is running."
    })
})

app.use('/api/seller/dashboard',sellerRoutes)

module.exports = app;