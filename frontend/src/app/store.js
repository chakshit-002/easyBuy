import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/products/productSlice';
import cartReducer from '../features/cart/cartSlice';
import addressReducer from '../features/address/addressSlice';
import orderReducer from '../features/order/orderSlice';
import chatReducer from '../features/chat/chatSlice';
import sellerReducer from '../features/seller/sellerSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        cart: cartReducer,
        address: addressReducer,
        order: orderReducer,
        aiChat: chatReducer,
        seller: sellerReducer,
    },
});