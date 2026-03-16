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

const orderSlice = createSlice({
    name: 'order',
    initialState: {
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
            .addCase(createOrderAsync.rejected, (state) => { state.loading = false; });
    }
});

export default orderSlice.reducer;