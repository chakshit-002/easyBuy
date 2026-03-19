// product side listener.js
const productModel = require('../models/product.model');
const { subscribeToQueue, publishToQueue } = require('../broker/broker');

module.exports = async function () {

    // Jab Order Cancel ho (Stock wapas badhao)
    // product/broker/listener.js (Service 3001)

    subscribeToQueue("ORDER_PRODUCT_SERVICE.ORDER_CANCELLED", async (order) => {
        console.log(`Restoring stock for Cancelled Order: ${order._id}`);
        try {
            for (const item of order.items) {
                // $inc: item.quantity (positive number) matlab stock badh jayega
                const updatedProduct = await productModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { new: true }
                );

                console.log(`Stock restored for ${item.product}. New Stock: ${updatedProduct.stock}`);

                // Dashboard sync taaki seller ko badha hua stock dikhe
                await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", updatedProduct);
            }
        } catch (err) {
            console.error("Stock restoration failed:", err.message);
        }
    });

    // product/listener.js
    subscribeToQueue("ORDER_PRODUCT_SERVICE.ORDER_CREATED", async (order) => {
        console.log("Order Received in Product Service:", order._id);
        try {
            for (const item of order.items) {
                // Yahan product dhoondna aur stock kam karna hai
                const result = await productModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } }, // Stock minus ho raha hai
                    { new: true }
                );
                console.log(`Updated Stock for ${item.product}: ${result.stock}`);

                // Dashboard sync ke liye
                await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", result);
            }
        } catch (err) {
            console.error("Stock update error:", err);
        }
    });
};