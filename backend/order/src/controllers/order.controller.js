const orderModel = require("../models/order.model")
const axios = require('axios')
const { publishToQueue } = require('../broker/broker')
const BASE_URL_1 = process.env.NODE_ENV === "production" ? "https://easybuy-product.onrender.com" : "http://localhost:3001"
const BASE_URL_2 = process.env.NODE_ENV === "production" ? "https://easybuy-cart.onrender.com" : "http://localhost:3002"
const BASE_URL_4 = process.env.NODE_ENV === "production" ? "https://easybuy-payment.onrender.com" : "http://localhost:3004"

// Helper function to fetch product details from Product Service
async function enrichOrderItems(items, token) {
    const productIds = items.map(item => item.product.toString());
    try {
        const productRes = await axios.get(`${BASE_URL_1}/api/products/bulk`, {
            params: { ids: productIds.join(',') },
            headers: { Authorization: `Bearer ${token}` }
        });
        const productsData = productRes.data;

        return items.map(item => {
            const info = productsData.find(p => p._id === item.product.toString());
            return {
                ...item._doc,
                product: info || { title: "Product Unavailable", images: [{ url: 'https://placehold.co/100' }] }
            };
        });
    } catch (err) {
        console.error("Enrichment Failed:", err.message);
        return items; // Fallback to original items
    }
}

async function createOrder(req, res) {
    const user = req.user;

    //inter service data transfer ke time headers ka use krege 
    //uske liye axios install krna pdega 
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    try {

        if (!req.body.shippingAddress) {
            return res.status(400).json({ message: "Shipping address is required" });
        }

        //fetch user cart from cart service
        const cartResponse = await axios.get(`${BASE_URL_2}/api/cart`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!cartResponse.data.cart || cartResponse.data.cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // console.log("cart response", cartResponse.data, cartResponse.data.cart.items)


        let priceAmount = 0;

        const orderItems = await Promise.all(cartResponse.data.cart.items.map(async (item) => {

            const pId = item.productId._id || item.productId;

            const productRes = await axios.get(`${BASE_URL_1}/api/products/${pId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const product = productRes.data.data;

            //if not in stock, does not allow order creation

            if (product.stock < item.quantity) {

                throw new Error(`Product ${product.title} is out of stock or insufficient stock`)
            }
            const itemTotal = product.price.amount * item.quantity;

            priceAmount += itemTotal;

            return {
                product: pId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: product.price.currency || "INR"
                }
            }
        }))

        // console.log("Total price amount",priceAmount);
        // console.log(orderItems)
        try {
            await axios.get(`${BASE_URL_4}/api/payments/health`, { timeout: 2000 });
        } catch (paymentErr) {
            // Agar payment service down hai, toh yahi se error bhej do
            return res.status(503).json({
                message: "Payment Gateway is currently down. Please try again later.",
                error: "Payment Service Unreachable"
            });
        }
        
        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: "PENDING",
            totalPrice: {
                amount: priceAmount,
                currency: "INR"
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
        // 1. Seller Dashboard sync (Revenue/Sales ke liye)
        // await publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order)
        // 2. YE ADD isliye kiya  kyu ki Product Service sync (Stock kam karne ke liye)
        // await publishToQueue("ORDER_PRODUCT_SERVICE.ORDER_CREATED", order);

        await Promise.all([
            // 1. Seller Dashboard sync (Revenue/Sales ke liye)
            publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", order),
            // 2. YE ADD isliye kiya  kyu ki Product Service sync (Stock kam karne ke liye)
            publishToQueue("ORDER_PRODUCT_SERVICE.ORDER_CREATED", order)
        ])
        console.log("Message sent to Product Service for stock reduction");

        res.status(201).json({
            order
        })
    }
    catch (err) {
        if (err.message.endsWith("insufficient stock")) {
            return res.status(400).json({
                message: "Some products are out of stock",
                error: err.message
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }

}

// GET MY ORDERS
async function getMyOrders(req, res) {
    try {
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
        const orders = await orderModel.find({ user: req.user.id }).sort({ createdAt: -1 });

        const enrichedOrders = await Promise.all(orders.map(async (order) => {
            const enrichedItems = await enrichOrderItems(order.items, token);
            return { ...order._doc, items: enrichedItems };
        }));

        res.status(200).json({ orders: enrichedOrders });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

// GET ORDER BY ID
async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
        const order = await orderModel.findById(id);

        if (!order) return res.status(404).json({ message: "Order not found" });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        const enrichedItems = await enrichOrderItems(order.items, token);
        res.status(200).json({ order: { ...order._doc, items: enrichedItems } });
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}

async function cancelOrderById(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            })
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden you don't have access to this order"
            })
        }

        //only pending  orders can be cancelled
        if (order.status !== "PENDING") {
            return res.status(409).json({
                message: "Order cannot be cancelled at  this stage"
            })
        }

        order.status = "CANCELLED";
        const updatedOrder = await order.save();



        await Promise.all([
            // 1. Dashboard sync (Revenue kam karne ke liye)
            publishToQueue("ORDER_SELLER_DASHBOARD.ORDER_CANCELLED", updatedOrder.toObject()),

            // 2.  Product Service ko batane ke liye ki stock WAPAS BADHAO
            publishToQueue("ORDER_PRODUCT_SERVICE.ORDER_CANCELLED", updatedOrder.toObject())
        ])

        res.status(200).json({
            order
        })
    } catch (err) {
        console.error(err)

        res.status(500).json({ message: "Internal server error", error: err.message })
    }
}

async function updateOrderAddress(req, res) {

    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You don't have  access to this order"
            })
        }

        if (order.status !== "PENDING") {
            return res.status(409).json({
                message: "Order address cannot be updated at this stage"
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

    } catch (err) {
        res.status(500).json({
            message: "INTERNAL Server error", error: err.message
        })
    }
}

module.exports = {
    createOrder, getMyOrders, getOrderById, cancelOrderById, updateOrderAddress
};