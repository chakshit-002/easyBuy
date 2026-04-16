import axios from 'axios';

// Base URLs for different services
// const SERVICES = {
//     AUTH: 'http://localhost:3000/api/auth',
//     PRODUCT: 'http://localhost:3001/api/products',
//     CART: 'http://localhost:3002/api/cart',
//     ORDER: 'http://localhost:3003/api/orders',
//     PAYMENT: 'http://localhost:3004/api/payments',
//     AI: 'http://localhost:3005/',
//     SELLER: 'http://localhost:3007/api/seller/dashboard',
//     // NOTIFICATION: 'http://localhost:3006/',
// };

const SERVICES = {
    AUTH: import.meta.env.VITE_AUTH_API_URL ||  'http://localhost:3000/api/auth' ,
    PRODUCT: import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3001/api/products',
    CART: import.meta.env.VITE_CART_API_URL || 'http://localhost:3002/api/cart',
    ORDER: import.meta.env.VITE_ORDER_API_URL || 'http://localhost:3003/api/orders',
    PAYMENT: import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3004/api/payments',
    AI: import.meta.env.VITE_AI_BUDDY_API_URL || 'http://localhost:3005/',
    SELLER: import.meta.env.VITE_SELLER_DASHBOARD_API_URL || 'http://localhost:3007/api/seller/dashboard',
    // NOTIFICATION: 'http://localhost:3006/',
};

// Generic API Creator function
const createAPI = (baseURL) => {
    return axios.create({
        baseURL,
        withCredentials: true, // Sabhi services ke liye cookies enable rahengi
    });
};


// Export individual service instances
export const authAPI = createAPI(SERVICES.AUTH);
export const productAPI = createAPI(SERVICES.PRODUCT);
export const cartAPI = createAPI(SERVICES.CART);
export const orderAPI = createAPI(SERVICES.ORDER);
export const paymentAPI = createAPI(SERVICES.PAYMENT);
export const aiAPI = createAPI(SERVICES.AI);
export const sellerAPI = createAPI(SERVICES.SELLER);


const apiInstances = [authAPI, productAPI, cartAPI, orderAPI, paymentAPI, aiAPI, sellerAPI];

apiInstances.forEach((instance) => {
    instance.interceptors.request.use(
        (config) => {
            // LocalStorage se user nikalna (Kyuki tumne slice mein wahan save kiya hai)
            const user = JSON.parse(localStorage.getItem('user'));
            
            // Agar tumne token user object ke andar bheja hai backend se:
            if (user && user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
});



// Default export (optional, maybe points to Auth or Gateway)
export default authAPI;