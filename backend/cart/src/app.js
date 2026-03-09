const express = require('express')
const cartRoutes = require('./routes/cart.routes')
const  cookieParser =   require('cookie-parser')

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
        message:"Cart Service is running"
    })
})

app.use('/api/cart',cartRoutes);

module.exports = app;
