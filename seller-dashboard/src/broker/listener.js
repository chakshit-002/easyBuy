const {subscribeToQueue} = require('../broker/broker')
const userModel = require("../models/user.model")
const  productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model')


module.exports = async function (){

    subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED",async(user) =>{
        await userModel.create(user)
        console.log(user)
    });
    
    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED",async(product)=>{
        await productModel.create(product);
         console.log(product)
    });

    subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async(order)=>{
        await orderModel.create(order);
        console.log(order)
    });

    subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED",async(payment)=>{
        await paymentModel.create(payment)
        console.log(payment)
    })

    subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE",async (payment)=>{
        await paymentModel.findOneAndUpdate({
            orderId: payment.orderId
        },{...payment})
    })
}

