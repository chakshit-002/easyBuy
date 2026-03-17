import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderAPI } from '../../api/axios'; // Tumhari config file se
import toast from 'react-hot-toast';

// 1. Order Create Karo (Backend Service 3003)
export const createOrderAsync = createAsyncThunk(
    'order/create',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await orderAPI.post('/', orderData);
            return response.data.order;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Order creation failed");
        }
    }
);


export const fetchMyOrdersAsync = createAsyncThunk(
    'order/fetchMyOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderAPI.get('/me'); 
            return response.data.orders;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch orders");
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [], // Saare orders ke liye
        currentOrder: null,
        loading: false,
    },
    extraReducers: (builder) => {
        builder
            .addCase(createOrderAsync.pending, (state) => { state.loading = true; })
            .addCase(createOrderAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(createOrderAsync.rejected, (state) => { state.loading = false; })
            // Fetch Orders Cases
            .addCase(fetchMyOrdersAsync.pending, (state) => { state.loading = true; })
            .addCase(fetchMyOrdersAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchMyOrdersAsync.rejected, (state) => { state.loading = false; });
    }
});

export default orderSlice.reducer;