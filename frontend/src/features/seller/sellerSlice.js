import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { sellerAPI, productAPI } from '../../api/axios';
import { logoutUser } from '../auth/authSlice';

// 1. Thunk to fetch Metrics
export const fetchSellerMetrics = createAsyncThunk(
    'seller/fetchMetrics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sellerAPI.get('/metrics');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch metrics");
        }
    }
);

// 2. Thunk to fetch Seller's specific products
export const fetchMyProducts = createAsyncThunk(
    'seller/fetchMyProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sellerAPI.get('/products');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch products");
        }
    }
);

export const createProductAsync = createAsyncThunk(
    'seller/createProduct',
    async (formData, { rejectWithValue }) => {
        try {
            // Dhyan de: Ye Product Service (3001) par jayega
            const response = await productAPI.post('/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const fetchSellerOrders = createAsyncThunk(
    'seller/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await sellerAPI.get('/orders');
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response?.data || "Failed to fetch orders");
        }
    }
);

const sellerSlice = createSlice({
    name: 'seller',
    initialState: {
        metrics: null,
        myProducts: [],
        myOrders: [],
        loading: false,
        createLoading: false,
        error: null
    },
    // reducers: {
    //     clearSellerState: (state) => {
    //         state.metrics = null;
    //         state.myProducts = [];
    //         state.myOrders = [];
    //         state.error = null;
    //     }
    // },
    extraReducers: (builder) => {
        builder
            // Metrics Handlers
            .addCase(fetchSellerMetrics.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchSellerMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchSellerMetrics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // My Products Handlers
            .addCase(fetchMyProducts.fulfilled, (state, action) => {
                state.myProducts = action.payload;
            })
            .addCase(createProductAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProductAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Important: Naya product myProducts array mein push karo 
                // taaki UI turant update ho jaye refresh kiye bina
                if (action.payload.data) {
                    state.myProducts.unshift(action.payload.data);
                }
            })
            .addCase(createProductAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || "Something went wrong";
            })
            // --- SELLER ORDERS ---
            .addCase(fetchSellerOrders.pending, (state) => { state.loading = true; })
            .addCase(fetchSellerOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.myOrders = action.payload; // 👈 Dashboard par order list sync
            })
            .addCase(fetchSellerOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
           .addCase(logoutUser.fulfilled, (state) => {
            state.metrics = null;
            state.myProducts = [];
            state.myOrders = [];
            state.error = null;
            console.log("Seller state cleared because user logged out!");
            // yh likh lliya hai clearSellerState ki jagah nahi toh wahan pr jahan jahan logout hota wahan isko dispatch krna pdtha 
        });
    }
});


// ACTIONS EXPORT
// export const { clearSellerState } = sellerSlice.actions;

// REDUCER EXPORT (Ye line miss ho rahi thi tumse)
export default sellerSlice.reducer;