const cartModel = require("../models/cart.model")
const axios = require('axios');
const BASE_URL_1 = process.env.NODE_ENV === "production" ? "https://easybuy-product.onrender.com" : "http://localhost:3001"

async function getCart(req, res) {
    try {
        const user = req.user;

        // 1. Cart Service ki apni DB se cart dhoondo
        let cart = await cartModel.findOne({ user: user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(200).json({
                cart: { items: [] },
                totals: { itemCount: 0, totalAmount: 0 }
            });
        }

        // 2. Sari Product IDs nikalo
        const productIds = cart.items.map(item => item.productId.toString());

        // 3. Product Service ko call krna details ke liye (Server-to-Server)
        // Note: Yahan wahi port use karege jo Product Service ka hai
        const productResponse = await axios.get(`${BASE_URL_1}/api/products/bulk`, {
            params: { ids: productIds.join(',') }
        });

        const productsData = productResponse.data;

        // 4. Data Merge Karo: Cart items + Product details
        const enrichedItems = cart.items.map(cartItem => {
            const productInfo = productsData.find(p => p._id.toString() === cartItem.productId.toString());
            return {
                _id: cartItem._id,
                quantity: cartItem.quantity,
                productId: productInfo || { _id: cartItem.productId, title: "Product Not Found", price: { amount: 0 } }
                //maan loh seller ne delete kr diya pr kisi user  ke cart mei hai toh app crash se bachne ke liye likha hai.... || ke baad vala
            };
        });

        // 5. Totals Calculate karna
        const subtotal = enrichedItems.reduce((acc, item) => {
            return acc + ((item.productId?.price?.amount || 0) * item.quantity);
        }, 0);

        res.status(200).json({
            cart: {
                ...cart._doc,
                items: enrichedItems
            },
            totals: {
                itemCount: enrichedItems.length,
                subtotal
            }
        });

    } catch (error) {
        console.error("Error in getCart aggregator:", error.message);
        res.status(500).json({ message: "Failed to fetch cart details", error: error.message });
    }
}


async function addItemToCart(req, res) {
    try {
        const { productId, qty } = req.body;
        const user = req.user;

        // 1. Validation
        if (!productId || !qty || qty < 1) {
            return res.status(400).json({ message: "Valid Product ID and Quantity are required" });
        }

        // 2. Cart dhoondo ya naya banao
        let cart = await cartModel.findOne({ user: user.id });
        if (!cart) {
            cart = new cartModel({ user: user.id, items: [] });
        }

        // 3. Logic: Add or Update Quantity
        const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].quantity += qty;
        } else {
            cart.items.push({ productId, quantity: qty });
        }

        await cart.save();

        // 4. ENRICHMENT: Product Service se details mangwana
        // Ye step zaroori hai taaki Redux state mein turant Title/Price dikhe
        const productIds = cart.items.map(item => item.productId.toString());
        
        try {
            const productResponse = await axios.get(`${BASE_URL_1}/api/products/bulk`, {
                params: { ids: productIds.join(',') }
            });
            
            const productsData = productResponse.data;

            const enrichedItems = cart.items.map(cartItem => {
                const productInfo = productsData.find(p => p._id.toString() === cartItem.productId.toString());
                return {
                    _id: cartItem._id,
                    quantity: cartItem.quantity,
                    productId: productInfo || { _id: cartItem.productId, title: "Product details unavailable", price: { amount: 0 } }
                };
            });

            // 5. Success Response with Enriched Data
            return res.status(200).json({
                message: "Item added to cart",
                cart: { ...cart._doc, items: enrichedItems }
            });

        } catch (apiError) {
            console.error("Product Service Call Failed:", apiError.message);
            // Agar details nahi mili, toh sirf ID bhej do crash karne ki jagah
            return res.status(200).json({
                message: "Item added, but details couldn't be fetched",
                cart
            });
        }

    } catch (error) {
        console.error("Add to Cart Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

async function updateItemQuantity(req, res) {
    try {
        const { productId } = req.params;
        const { qty } = req.body;
        const user = req.user;

        // 1. Validation: Quantity zero ya negative nahi honi chahiye
        if (!qty || qty < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        // 2. Database Call: Cart dhoondo
        const cart = await cartModel.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // 3. Item Check: Kya wo product cart mein hai?
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in your cart' });
        }

        // 4. Update Quantity
        cart.items[itemIndex].quantity = qty;
        await cart.save();

        // 5. ENRICHMENT (Fetching details from Product Service)
        const productIds = cart.items.map(item => item.productId.toString());
        let enrichedItems = [];

        try {
            // Server-to-Server call with Timeout handling
            const productResponse = await axios.get(`${BASE_URL_1}/api/products/bulk`, {
                params: { ids: productIds.join(',') },
                timeout: 5000 // 5 seconds mein reply nahi aaya toh cancel
            });

            const productsData = productResponse.data;

            enrichedItems = cart.items.map(cartItem => {
                const productInfo = productsData.find(p => p._id.toString() === cartItem.productId.toString());
                return {
                    _id: cartItem._id,
                    quantity: cartItem.quantity,
                    productId: productInfo || { _id: cartItem.productId, title: "Product Currently Unavailable", price: { amount: 0 } }
                };
            });
        } catch (apiError) {
            // AGAR PRODUCT SERVICE DOWN HAI:
            // Toh crash mat karo, purana cart structure bhej do (taki UI na tute)
            console.error("Product Service Error:", apiError.message);
            enrichedItems = cart.items.map(item => ({
                _id: item._id,
                quantity: item.quantity,
                productId: item.productId // Sirf ID rahegi
            }));
        }

        // 6. Final Response
        return res.status(200).json({
            message: 'Quantity updated successfully',
            cart: { ...cart._doc, items: enrichedItems }
        });

    } catch (error) {
        // 7. Global Error Catching
        console.error("Internal Server Error (Cart Update):", error);
        return res.status(500).json({
            message: "Something went wrong on our side",
            error: error.message
        });
    }
}

async function removeItemFromCart(req, res) {
    try {
        const { productId } = req.params;
        const user = req.user;

        // 1. Basic Validation
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        // 2. Database Call
        const cart = await cartModel.findOne({ user: user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // 3. Check if Item Exists (Comparison using .toString() for safety)
        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());

        // Agar filter ke baad count change nahi hua, matlab item tha hi nahi
        if (cart.items.length === initialItemCount) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // 4. Save Updated Cart
        await cart.save();
        
        console.log("Item removed successfully:", productId);

        // 5. ENRICHMENT (Fetching details for remaining items)
        const productIds = cart.items.map(item => item.productId.toString());
        let enrichedItems = [];

        if (productIds.length > 0) {
            try {
                // Server-to-Server call with a timeout
                const productResponse = await axios.get(`${BASE_URL_1}/api/products/bulk`, {
                    params: { ids: productIds.join(',') },
                    timeout: 5000 // 5 seconds wait time
                });

                const productsData = productResponse.data;

                enrichedItems = cart.items.map(cartItem => {
                    const productInfo = productsData.find(p => p._id.toString() === cartItem.productId.toString());
                    return {
                        _id: cartItem._id,
                        quantity: cartItem.quantity,
                        productId: productInfo || { 
                            _id: cartItem.productId, 
                            title: "Product details unavailable", 
                            price: { amount: 0 } 
                        }
                    };
                });
            } catch (apiError) {
                // Fallback: Agar Product Service respond na kare
                console.error("Product Service enrichment failed during removal:", apiError.message);
                enrichedItems = cart.items.map(item => ({
                    _id: item._id,
                    quantity: item.quantity,
                    productId: item.productId // Only ID will be sent
                }));
            }
        }

        // 6. Final Response
        return res.status(200).json({
            message: 'Item removed successfully',
            cart: { ...cart._doc, items: enrichedItems }
        });

    } catch (error) {
        // 7. Global Error Catching
        console.error("CRITICAL ERROR in removeItemFromCart:", error);
        return res.status(500).json({ 
            message: "Internal server error while removing item", 
            error: error.message 
        });
    }
}

module.exports = {
    addItemToCart,
    updateItemQuantity,
    getCart,
    removeItemFromCart
}