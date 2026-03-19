import axios from 'axios';

// Base URLs for different services
const SERVICES = {
    AUTH: 'http://localhost:3000/api/auth',
    PRODUCT: 'http://localhost:3001/api/products',
    CART: 'http://localhost:3002/api/cart',
    ORDER: 'http://localhost:3003/api/orders',
    PAYMENT: 'http://localhost:3004/api/payments',
    AI: 'http://localhost:3005/',
    // NOTIFICATION: 'http://localhost:3006/',
    SELLER: 'http://localhost:3007/api/seller/dashboard',
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

// Default export (optional, maybe points to Auth or Gateway)
export default authAPI;