import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/axios';

// features/cart/cartSlice.js
export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
    try {
        const response = await cartAPI.get('/', { withCredentials: true });
        // Backend bhej raha hai: { cart: {...}, totals: {...} }
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Fetch failed");
    }
});

export const addToCartAsync = createAsyncThunk(
    'cart/addItem',
    async (itemData, { rejectWithValue }) => {
        try {
            // itemData = { productId, qty: 1 }
            const response = await cartAPI.post('/items', itemData, { withCredentials: true });

            // Console check ke liye: dekho backend kya bhej raha hai
            console.log("Add to Cart Response:", response.data);

            return response.data; // Backend sends { message, cart }
        } catch (error) {
            // Agar backend se error aaye (jaise 400 Bad Request)
            return rejectWithValue(error.response?.data?.message || "Something went wrong");
        }
    }
);

// 1. Update Quantity Thunk
export const updateCartQtyAsync = createAsyncThunk(
  'cart/updateQty',
  async ({ productId, qty }, { rejectWithValue }) => {
    try {
      // Backend expect kar raha hai: PATCH /api/cart/items/:productId
      const response = await cartAPI.patch(`/items/${productId}`, { qty }, { withCredentials: true });
      return response.data; // Should return { message, cart }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update");
    }
  }
);

// 2. Remove Item Thunk (Future proofing)
export const removeFromCartAsync = createAsyncThunk(
    'cart/removeItem',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartAPI.delete(`/items/${productId}`, { withCredentials: true });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to remove");
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                // Backend structure: action.payload.cart.items
                state.items = action.payload?.cart?.items || [];
            })
            .addCase(addToCartAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Pehle check karo payload kaisa hai
                if (action.payload?.cart?.items) {
                    state.items = action.payload.cart.items;
                }
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.loading = false;
                // Error ko string mein rakho taaki React crash na ho
                state.error = String(action.payload);
            })
            .addCase(updateCartQtyAsync.pending, (state) => {
                // loading true nahi karenge taaki pura page na hile, 
                // bas background mein update ho jaye
                state.error = null;
            })
            .addCase(updateCartQtyAsync.fulfilled, (state, action) => {
                state.loading = false;
                // Backend se naya 'cart' aa raha hai, uske items se state update kardo
                if (action.payload?.cart?.items) {
                    state.items = action.payload.cart.items;
                }
            })
            .addCase(updateCartQtyAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export default cartSlice.reducer;