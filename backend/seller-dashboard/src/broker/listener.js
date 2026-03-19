const { subscribeToQueue } = require('../broker/broker')
const userModel = require("../models/user.model")
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const paymentModel = require('../models/payment.model')


module.exports = async function () {
    const options = { upsert: true, returnDocument: 'after' };
    subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        // await userModel.create(user) // isshe crash ho rha tha aur duplicay ka error aarha tha 
        try {
            await userModel.findOneAndUpdate(
                { _id: user._id }, // Filter: Is ID ka banda dhoondna
                { $set: user },    // Update: Pura data set karna
                options// Upsert: Nahi mila toh Create karna
            );
            console.log(`User Synced: ${user._id}`);
        } catch (err) { console.error("User Sync Error:", err); }
    });

    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", async (product) => {
        // await productModel.create(product);
        try {
            await productModel.findOneAndUpdate(
                { _id: product._id },
                { $set: product },
                options
            );
            console.log(`✅ Product Synced: ${product._id}`);
        } catch (err) { console.error("Product Sync Error:", err); }
    });

    subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CREATED", async (order) => {
        // await orderModel.create(order);
        try {
            await orderModel.findOneAndUpdate(
                { _id: order._id },
                { $set: order },
                options
            );
            console.log(`✅ Order Synced: ${order._id}`);
        } catch (err) { console.error("Order Sync Error:", err); }
    });

    subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_CREATED", async (payment) => {
        // await paymentModel.create(payment)
        try {
            await paymentModel.findOneAndUpdate(
                { _id: payment._id },
                { $set: payment },
                options
            );
            console.log(`✅ Payment Synced: ${payment._id}`);
        } catch (err) { console.error("Payment Sync Error:", err); }
    })

    subscribeToQueue("PAYMENT_SELLER_DASHBOARD.PAYMENT_UPDATE", async (payment) => {
        // await paymentModel.findOneAndUpdate({
        //     orderId: payment.orderId
        // }, { ...payment },
        //     // { upsert: true } // Agar nahi mila toh naya bana do!
        // )


        try {
            await paymentModel.findOneAndUpdate(
                { order: payment.order },
                { $set: payment },
                options
            );
            console.log(` Payment Updated for Order: ${payment.order}`);
        } catch (err) { console.error("Payment Update Error:", err); }
    })


    subscribeToQueue("ORDER_SELLER_DASHBOARD.ORDER_CANCELLED", async (order) => {
        try {
            await orderModel.findOneAndUpdate(
                { _id: order._id },
                { $set: order },
                options
            );
            console.log(`Order Cancelled Synced: ${order._id}`);
        } catch (err) { console.error("Order Cancelled Sync Error:", err); }
    })

    subscribeToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", async (product) => {
        try {
            await productModel.findOneAndUpdate(
                { _id: product._id },
                { $set: product },
                { upsert: true }
            );
            console.log(`✅ Seller Dashboard Inventory Updated: ${product._id}`);
        } catch (err) {
            console.error("Seller Product Sync Error:", err);
        }
    });
}


// Mongoose Warning (new option)
// Terminal mein jo  warning  wo keh rahi hai ki { new: true } ab purana ho gaya hai.

// Fix -- Jahan-jahan tumne { new: true } likha hai, use badal kar { returnDocument: 'after' } kar do. Result wahi milega, bas warning gayab ho jayegi.
// const options = { upsert: true, returnDocument: 'after' };
