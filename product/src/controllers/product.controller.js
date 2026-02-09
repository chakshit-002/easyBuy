const productModel = require("../models/product.model")
const { uploadImage } = require('../services/imagekit.service')


//accepts multipart/form-data with fields...
async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR' } = req.body

        if (!title || !priceAmount) {
            return res.status(400).json({
                message: "title, priceAmount and seller are required"
            });
        }
        const seller = req.user.id //extract seller from authenticated user 

        const price = {
            amount: Number(priceAmount),
            currency: priceCurrency
        };

        const images = await Promise.all((req.files || []).map(file => uploadImage({ buffer: file.buffer })))
        // const images = [];
        // const files = await Promise.all(
        //     (req.files || []).map(file => uploadImage
        //         ({buffer: file.buffer})
        //     )
        // )

        const product = await productModel.create({
            title,
            description,
            price,
            seller,
            images
        });
        return res.status(201).json({
            message: "product created",
            data: product,
        })

    } catch (err) {
        console.error("Create product err", err);
        return res.status(500).json({
            message: "Internal  server error on productside"
        })
    }
}



module.exports = {
    createProduct
}