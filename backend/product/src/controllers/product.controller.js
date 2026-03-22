const productModel = require("../models/product.model")
const { uploadImage } = require('../services/imagekit.service')
const mongoose = require('mongoose');
const { publishToQueue } = require('../broker/broker')

//accepts multipart/form-data with fields...
async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, priceCurrency = 'INR', stock } = req.body

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
            images,
            stock
        });

        await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED", product)
        await publishToQueue("PRODUCT_NOTIFICATION.PRODUCT_CREATED", {
            productId: product._id,
            sellerId: seller,
            email: req.user.email,
            username: req.user.username
        })
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

// bhot chizze create krege -> search query aaegi then sort krege etc
async function getProducts(req, res) {
    //toh iske liye product model mei index create krna hoga 

    //aur yh saare optional hote hai  aae ya naa aae
    const { q, minprice, maxprice, skip = 0, limit = 20 } = req.query;

    const filter = {}

    if (q) {
        //mongodb atlas syntax
        filter.$text = { $search: q }
    }

    if (minprice) {
        filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minprice) }
    }

    if (maxprice) {
        filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxprice) }
    }

    //total dekhna ki ui pr next ya previous ke liye
    const [products, total] = await Promise.all([
        productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20)),
        productModel.countDocuments(filter) // Ye batayega total kitne products hain
    ]);

    // const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20));

    return res.status(200).json({
        data: products,
        total: total, // Ye UI ke liye bohot zaruri hai
        hasMore: total > Number(skip) + products.length // Ye batayega aur data hai ya nahi
    })



}

async function getProductById(req, res) {

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product id' });
    }
    const product = await productModel.findById(id);

    if (!product) {
        return res.status(404).json({
            message: "product not found"
        });
    }

    return res.status(200).json({ data: product });

}

async function updateProduct(req, res) {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await productModel.findOne({
        _id: id
    })

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        })
    }
    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden: You can only update your product"
        })
    }
    const allowedUpdates = ['title', 'description', 'price'];

    for (const key of Object.keys(req.body)) {
        if (allowedUpdates.includes(key)) {
            if (key === 'price' && typeof req.body.price === 'object') { // puri value overwrite na ho isliye object hai toh ek-ek krke update krega values
                if (req.body.price.amount !== undefined) {
                    product.price.amount = Number(req.body.price.amount);
                }
                if (req.body.price.currency !== undefined) {
                    product.price.currency = req.body.price.currency;
                }
            } else {
                product[key] = req.body[key];
            }
        }
    }

    await product.save();
    return res.status(200).json({
        message: "product updated",
        product
    })
}


async function deleteProduct(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await productModel.findOne({
        _id: id
    })

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        })
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({
            message: "Forbidden :  You can only delete your own products"
        })
    }

    await productModel.findOneAndDelete({ _id: id });
    return res.status(200).json({
        message: "Product deleted"
    })
}

async function getProductsBySeller(req, res) {
    const seller = req.user

    const { skip = 0, limit = 20 } = req.query;

    const products = await productModel.find({ seller: seller.id }).skip(skip).limit(Math.min(limit, 20));

    return res.status(200).json({
        data: products
    })
}

async function getProductsByIds(req, res) {
    try {
        const { ids } = req.query; // Expecting: "id1,id2,id3"

        // 1. Validation: Check agar ids bheji hi nahi hain
        if (!ids || ids.trim() === "") {
            return res.status(400).json({
                message: "No product IDs provided"
            });
        }

        // 2. String ko array mein convert karo aur faltu spaces saaf karo
        const idArray = ids.split(',').map(id => id.trim());

        // 3. Validation: Check karo ki IDs valid MongoDB ObjectIds hain ya nahi
        const isValid = idArray.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!isValid) {
            return res.status(400).json({
                message: "One or more Product IDs are invalid"
            });
        }

        // 4. Database query: $in operator saare matches ek baar mein le aayega
        const products = await productModel.find({
            _id: { $in: idArray }
        });

        // 5. Response handling
        if (!products || products.length === 0) {
            return res.status(404).json({
                message: "No products found for the given IDs"
            });
        }

        res.status(200).json(products);

    } catch (error) {
        // 6. Global Error Catching
        console.error("Error in getProductsByIds:", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}


// Ye function tab kaam aayega jab hume check karna ho ki stock hai ya nahi
async function checkAndReduceStock(items) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        for (const item of items) {
            const product = await productModel.findById(item.product).session(session);
            
            if (!product) throw new Error(`Product not found: ${item.product}`);
            
            if (product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${product.title}. Only ${product.stock} left.`);
            }

            product.stock -= item.quantity;
            await product.save({ session });
            
            // Sync to Seller Dashboard
            await publishToQueue("PRODUCT_SELLER_DASHBOARD.PRODUCT_UPDATED", product);
        }
        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, message: error.message };
    } finally {
        session.endSession();
    }
}

async function validateStock(req, res) {
    try {
        const { items } = req.body;
        for (const item of items) {
            const product = await productModel.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product ? product.stock : 0} left for ${product ? product.title : 'item'}`
                });
            }
        }
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Stock check failed" });
    }
}
module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsBySeller,
    getProductsByIds, 
    checkAndReduceStock,
    validateStock
   
}