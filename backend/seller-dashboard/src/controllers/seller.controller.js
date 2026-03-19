const userModel = require("../models/user.model")
const orderModel = require("../models/order.model")
const paymentModel = require("../models/payment.model")
const productModel = require("../models/product.model")

const mongoose = require('mongoose')

async function getMetrics(req, res) {
    try {
        const seller = req.user;
        // console.log(seller);
        // Get all products for this seller
        const products = await productModel.find({ seller: seller.id });
        const productIds = products.map(p => p._id);
        // console.log("products ", products[0])
        // console.log("productIds ", productIds)
        // Get all orders containing seller's products
        const orders = await orderModel.find({
            'items.product': { $in: productIds },
            status: { $in: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"] }
        });

        // console.log("order", orders)
        // Sales: total number of items sold
        let sales = 0;
        let revenue = 0;
        const productSales = {};

        orders.forEach(order => {
            // Har order ka total ek hi baar add hona chahiye per seller item
            order.items.forEach(item => {
                // Safe Comparison using String
                const itemId = item.product.toString();
                const isSellersProduct = productIds.some(pId => pId.toString() === itemId);

                if (isSellersProduct) {
                    const itemQty = Number(item.quantity) || 0;
                    const itemPrice = Number(item.price.amount) || 0;

                    sales += itemQty;
                    revenue += (itemPrice);

                    // Debugging log (Terminal mein check karo calculation sahi ho rahi hai ya nahi)
                    // console.log(`Adding Item: ${itemId} | Qty: ${itemQty} | Price: ${itemPrice} | Subtotal: ${itemPrice * itemQty}`);

                    productSales[itemId] = (productSales[itemId] || 0) + itemQty;
                }
            });
        });

        // Top products by quantity sold
        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([productId, qty]) => {
                const prod = products.find(p => p._id.equals(productId));
                return prod ? { id: prod._id, title: prod.title, sold: qty } : null;
            })
            .filter(Boolean);

        // console.log("Sending Metrics to Frontend:", { sales, revenue, topProducts });
        return res.json({
            sales,
            revenue,
            topProducts
        });
    } catch (error) {
        console.error("Error fetching metrics:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}


async function getOrders(req, res) {
    try {
        const seller = req.user;

        // Get all products for this seller
        const products = await productModel.find({ seller: seller._id });
        const productIds = products.map(p => p._id);

        // Get all orders containing seller's products
        const orders = await orderModel.find({
            'items.product': { $in: productIds }
        }).populate('user', 'name email').sort({ createdAt: -1 });

        // Filter order items to only include those from this seller
        const filteredOrders = orders.map(order => {
            const filteredItems = order.items.filter(item => productIds.includes(item.product));
            return {
                ...order.toObject(),
                items: filteredItems
            };
        }).filter(order => order.items.length > 0);
        return res.json(filteredOrders);
    } catch (error) {
        console.error("Error fetching orders:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function getProducts(req, res) {

    try {
        const seller = req.user;
        console.log(seller)
        const sellerId = new mongoose.Types.ObjectId(seller.id);
        const products = await productModel.find({ seller: sellerId }).sort({ createdAt: -1 });

        return res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error)
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

}



module.exports = {
    getMetrics,
    getOrders,
    getProducts
}