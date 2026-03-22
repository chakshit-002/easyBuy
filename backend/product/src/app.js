const express = require('express')
const cookieParser = require("cookie-parser")
const productRoutes = require("./routes/product.routes")
const cors = require('cors')
const app = express();
const allowedOrigins = [

    "http://localhost:5173",
    "https://easybuy-store.netlify.app"

];

app.use(express.json());
app.use(cookieParser());


//  Backend Service mein 
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));


//health check route 
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Product Service is running"
    })
})

app.use("/api/products",productRoutes)

module.exports = app;

