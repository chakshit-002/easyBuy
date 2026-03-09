const express = require('express')
const cookieParser = require('cookie-parser')
const orderRoutes = require('./routes/order.routes')

const app = express();

app.use(express.json());
app.use(cookieParser());

//  Backend Service mein 
app.use(cors({
    origin: 'http://localhost:5173',// React URL
    credentials: true
}));


//health check route 
app.get('/',(req,res)=>{
    res.status(200).json({
        message:"Order Service is running"
    })
})

app.use('/api/orders',orderRoutes);

module.exports = app;