const SERVICE_URLS = [
    import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3000',
    import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3001',
    import.meta.env.VITE_CART_API_URL || 'http://localhost:3002',
    import.meta.env.VITE_ORDER_API_URL || 'http://localhost:3003',
    import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3004',
    import.meta.env.VITE_AI_BUDDY_API_URL || 'http://localhost:3005',
    import.meta.env.VITE_SELLER_DASHBOARD_API_URL || 'http://localhost:3007'
];

const ServiceWaker = async () => {
    console.log("🚀 Initializing Service Wake-up...");

    SERVICE_URLS.forEach(url => {
        try {
            // 1. "URL" object full path mein se origin (domain) nikaal leta hai
            // Example: "https://auth.onrender.com/api/auth" -> "https://auth.onrender.com"
            const baseUrl = new URL(url).origin;

            // 2. Sirf Base URL hit karo (Health Check route '/')
            fetch(baseUrl, { mode: 'no-cors' })
                .then(() => console.log(`Pinged: ${baseUrl}`))
                .catch(() => console.log(`Waking up: ${baseUrl}`));
                
        } catch (err) {
            console.error("Invalid URL in ServiceWaker:", url);
        }
    });
};

export default ServiceWaker;



// import { authAPI, productAPI, cartAPI, orderAPI, paymentAPI, aiAPI, sellerAPI } from '../api/axios';

// const services = [authAPI, productAPI, cartAPI, orderAPI, paymentAPI, aiAPI, sellerAPI];

// const ServiceWaker = async () => {
//     console.log("Waking up all services...");
    
//     // Sabhi services ko parallel mein ping karo (Health check route '/')
//     services.forEach(api => {
//         api.get('/').catch(err => {
//             // Hum sirf jagana chahte hain, agar error aaye toh ignore karo
//             console.log(`Pinged a service: ${api.defaults.baseURL}`);
//         });
//     });
// };


// export default  ServiceWaker;


// src/utils/ServiceWaker.js