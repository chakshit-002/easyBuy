const sendEmail = require("../email")
const { subscribeToQueue } = require("./broker")

module.exports = function () {
    subscribeToQueue('AUTH_NOTIFICATION.USER_CREATED', async (data) => {
        // console.log("received data from queue", data)

        const emailTemplate =
            `
        <h1>Welcome to Our Services!</h1>
        <p>Dear ${data.fullName.firstName + " " + (data.fullName.lastName || " ")}</p>
        <p>Thank you for registering with us.</p>
        <p>Best regards, <br/> The Team</p>

        `

        await sendEmail(data.email, "Welcome to Our Service ", "Thank you for registering with us!", emailTemplate)
    })

    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_INITIATED", async (data) => {
        const emailHTMLTemplate = `
        <h1>Payment Initiated</h1>
        <p>Dear ${data.username},</p>
        <p>Your payment of ${data.currency} ${data.amount} for the order ID: ${data.orderId} has been initiated.</p>
        <p>We will notify you once the payment is completed.</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "Payment Initiated", "Your payment is being processed", emailHTMLTemplate);
    })

    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_COMPLETED", async (data) => {
        const emailTemplate =
            `
        <h1>Payment Successful!</h1>
        <p>Dear ${data.username}</p>
        <p>We have received  your payment of ${data.currency} ${data.amount} for the  orderId - ${data.orderId}.</p>
        <p>Thankyou for your purchase!</p>
        <p>Best regards, <br/> The Team</p>
        `;

        await sendEmail(data.email, "Payment  Successful", "We have received your payment", emailTemplate)
    })


    subscribeToQueue("PAYMENT_NOTIFICATION.PAYMENT_FAILED", async (data) => {
        const emailHTMLTemplate = `
        <h1>Payment Failed</h1>
        <p>Dear ${data.username},</p>
        <p>Unfortunately, your payment for the order ID: ${data.orderId} has failed.</p>
        <p>Please try again or contact support if the issue persists.</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "Payment Failed", "Your payment could not be processed", emailHTMLTemplate);
    })


    subscribeToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", async (data) => {
        const emailHTMLTemplate = `
        <h1>New Product Available!</h1>
        <p>Dear ${data.username},</p>
        <p>Check it out and enjoy exclusive launch offers!</p>
        <p>Best regards,<br/>The Team</p>
        `;
        await sendEmail(data.email, "New Product Launched", "Check out our latest product", emailHTMLTemplate);
    })
}