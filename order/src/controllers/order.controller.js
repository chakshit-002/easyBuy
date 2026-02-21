const orderModel = require("../models/order.model")
const axios = require('axios')
const {publishToQueue} = require('../broker/broker')


async function createOrder(req,res){
    const user = req.user;
    //inter service data transfer ke time headers ka use krege 
    //uske liye axios install krna pdega 
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    try{
        //fetch user cart from cart service
        const cartResponse = await axios.get(`http://localhost:3002/api/cart`,{
            headers:{
                Authorization: `Bearer ${token}`
            }
        })

        // console.log("cart response", cartResponse.data, cartResponse.data.cart.items)

        const products = await Promise.all(cartResponse.data.cart.items.map(async(item)=>{

            return (await axios.get(`http://localhost:3001/api/products/${item.productId}`,{
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })).data.data
        }))
        // console.log("Product fetched",products)
        let priceAmount = 0;

        const orderItems = cartResponse.data.cart.items.map((item,index)=>{

            const product = products.find(p=>p._id === item.productId);

            //if not in stock, does not allow order creation

            if(product.stock < item.quantity){
                throw new Error(`Product ${product.title} is out of stock or insufficient stock`)
            }
            const itemTotal = product.price.amount * item.quantity;

            priceAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                price:{
                    amount: itemTotal,
                    currency: product.price.currency
                }
            }
        })

        // console.log("Total price amount",priceAmount);
        // console.log(orderItems)
        
        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice:{
                amount: priceAmount,
                currency:"INR"
            },
            // shippingAddress: req.body.shippingAddress
            shippingAddress: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                pincode: req.body.shippingAddress.pincode,
                country: req.body.shippingAddress.country,
            }
        })

        await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED",order)
        
        res.status(201).json({
            order
        })
    }
    catch(err){
        console.log("Error fetching cart",err)
        res.status(500).json({
            message:"Internal server error ",error:err.message
        })
    }

}

async function getMyOrders(req,res){
    const user = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit ;

    try{
        const orders = await orderModel.find({
            user: user.id
        }).skip(skip).limit(limit).exec();
        const totalOrders = await orderModel.countDocuments({user: user.id});

        res.status(200).json({
            orders,
            meta:{
                total: totalOrders,
                page,
                limit
            }
        })
    }
    catch(err){
        res.status(500).json({
            message:"Internal Server error",error:err.message
        })
    }
}

async function getOrderById(req,res){
    const user = req.user;
    const orderId = req.params.id

    try{
        const order = await orderModel.findById(orderId);

        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }

        if(order.user.toString() !== user.id){
            return res.status(403).json({
                message: "Forbidden: You don't have access"
            })
        }

        res.status(200).json({
            order
        })

    }catch(err){
        res.status(500).json({
            message:"Internal server error",error: err.message
        })
    }
}

async function cancelOrderById(req,res){
    const user = req.user;
    const orderId = req.params.id;

    try{
        const order = await orderModel.findById(orderId);

        if(!order){
            return res.status(404).json({
                message:"Order not found"
            })
        }

        if(order.user.toString() !== user.id){
            return res.status(403).json({
                message:"Forbidden you don't have access to this order"
            })
        }
        
        //only pending  orders can be cancelled
        if(order.status !== "PENDING"){
            return res.status(409).json({
                message:"Order cannot be cancelled at  this stage"
            })
        }

        order.status = "CANCELLED";
        await order.save();
        res.status(200).json({
            order
        })
    }catch(err){
        console.error(err)

        res.status(500).json({message:"Internal server error",error:err.message})
    }
}

async function updateOrderAddress(req,res){

    const user = req.user;
    const orderId = req.params.id;

    try{
        const order = await orderModel.findById(orderId);

        if(!order){
            return res.status(404).json({
                message : "Order not found"
            });
        }

        if(order.user.toString() !== user.id){
            return res.status(403).json({
                message : "Forbidden: You do n't have  access to this order"
            })
        }

        if(order.status !== "PENDING"){
            return res.status(409).json({
                message:"Order address cannot be updated at this stage"
            })
        }

        order.shippingAddress = {
            street: req.body.shippingAddress.street,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state,
            pincode: req.body.shippingAddress.pincode,
            country: req.body.shippingAddress.country,
        }

        await order.save();

        res.status(200).json({
            order
        })

    }catch(err){
        res.status(500).json({
            message:"INTERNAL Server error",error:err.message
        })
    }
}

module.exports = {
    createOrder,getMyOrders,getOrderById,cancelOrderById,updateOrderAddress
};