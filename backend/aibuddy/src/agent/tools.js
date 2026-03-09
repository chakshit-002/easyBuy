// const {tool} = require('@langchain/core/tools')
// const {z} = require("zod")
// const axios = require('axios')

// //product serach and cart mei add krna hai 
//                                         //token ai ko bej ke generate ya change nahi krwaana toh metadata ke through bejege 
// const searchProduct = tool(async({query,token})=>{

//     const response  = await axios.get(`http://localhost:3001/api/products?q=${query}`,{
//         headers:{
//             Authorization: `Bearer ${token}`
//         }
//     })

//     return  JSON.stringify(response.data);
//     //final me saare hi  string mei hi return ho kyu ki AI string hi read krta hai aur AI ko object smj nahi aate
// },{
//     name:"searchProduct",
//     description: "Search for products based on a query",
//     schema: z.object({
//         query: z.string().describe("The  search query for products")
//     })
// })


// const addProductToCart = tool(async ({productId, qty=1, token})=>{

//     const response = await axios.post(`http://localhost:3002/api/cart/items`,{
//         productId,
//         qty 
//     },{
//         headers:{
//             Authorization: `Bearer ${token}`
//         }
//     })

//     return `Added product with id ${productId} (qty:${qty}) to cart  `

// },{
//     name:"addProductToCart",
//     description: "Add a  product to the shopping cart",
//     schema:z.object({
//         productId: z.string().describe("The id of the product to add to the cart "),
//         qty:z.number().describe("The quantity of the product to add to the cart").default(1),
//     })
// })


// module.exports = {
//     searchProduct,addProductToCart
// }



const { tool } = require('@langchain/core/tools');
const { z } = require("zod");
const axios = require('axios');

// 1. Search Product Tool
const searchProduct = tool(
    async ({ query }, config) => { // Token yahan config se aayega, AI se nahi
        try {
            const token = config.metadata.token; // Agent metadata se token nikalna
            
            const response = await axios.get(`http://localhost:3001/api/products?q=${query}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 5000 // 5 seconds timeout taaki tool hang na ho
            });

            // Agar data empty hai toh AI ko saaf batao
            if (!response.data || response.data.length === 0) {
                return `No products found for "${query}".`;
            }

            return JSON.stringify(response.data);
        } catch (error) {
            console.error("Search Tool Error:", error.message);
            return `Error searching for products: ${error.response?.data?.message || error.message}`;
        }
    },
    {
        name: "searchProduct",
        description: "Search for products based on a query",
        schema: z.object({
            query: z.string().describe("The search query for products")
        })
    }
);

// 2. Add to Cart Tool
const addProductToCart = tool(
    async ({ productId, qty = 1 }, config) => {
        try {
            const token = config.metadata.token;

            const response = await axios.post(`http://localhost:3002/api/cart/items`, 
                { productId, qty }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return `Success: Added ${qty} units of product ID ${productId} to the cart.`;
        } catch (error) {
            console.error("Cart Tool Error:", error.message);
            // Agar product stock mein nahi hai ya ID galat hai
            const errorMsg = error.response?.data?.message || error.message;
            return `Failed to add to cart: ${errorMsg}`;
        }
    },
    {
        name: "addProductToCart",
        description: "Add a product to the shopping cart using its productId",
        schema: z.object({
            productId: z.string().describe("The unique ID of the product"),
            qty: z.number().describe("Quantity to add").default(1),
        })
    }
);

module.exports = { searchProduct, addProductToCart };