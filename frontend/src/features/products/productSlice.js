import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../api/axios';

export const fetchAllProducts = createAsyncThunk('products/fetchAll', async (filters, thunkAPI) => {
    try {
        // filters like { search: 'phone', minPrice: 1000 }
        const response = await productAPI.get('/', { params: filters });
        return response.data; // Maan raha hoon backend products array bhej raha hai
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});

export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            // Axios automatically JSON parse kar deta hai, 
            // isliye .json() ki zaroorat nahi hai.
            const response = await productAPI.get(`/${id}`);

            // Response structure check karo (aksar response.data hota hai axios mein)
            return response.data;
        } catch (error) {
            // Agar backend se error aaye toh message pass karo
            return rejectWithValue(error.response?.data?.message || "Failed to fetch product");
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        total: 0,
        loading: false,
        error: null
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllProducts.pending, (state) => { state.loading = true; })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.loading = false;
                // Console log karke dekhte backend kya bhej raha hai
                console.log("Backend Data:", action.payload);

                // Backend se data uthao
                const newItems = action.payload.data || [];

                // Pagination mein hum humesha array replace karte hain
                state.items = newItems;

                // Backend se total count aur hasMore calculate karo
                state.total = action.payload.total || 0;

                // Agar items 20 hain (limit ke barabar), matlab next page ho sakta hai
                state.hasMore = newItems.length === 20;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload.data; // Data yahan save hoga
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default productSlice.reducer;