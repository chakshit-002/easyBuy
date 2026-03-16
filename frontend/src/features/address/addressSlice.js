import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/axios';



// 1. Fetch Addresses
export const fetchAddressesAsync = createAsyncThunk('address/fetch', async (_, { rejectWithValue }) => {
    try {
        const response = await authAPI.get('/users/me/addresses', { withCredentials: true });
        return response.data.addresses;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to load addresses");
    }
});

// 2. Add New Address
export const addAddressAsync = createAsyncThunk('address/add', async (addressData, { rejectWithValue }) => {
    try {
        const response = await authAPI.post('/users/me/addresses', addressData, { withCredentials: true });
        toast.success("Address added!");
        return response.data.address;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to add address");
    }
});

// 3. Delete Address
export const deleteAddressAsync = createAsyncThunk('address/delete', async (addressId, { rejectWithValue }) => {
    try {
        await authAPI.delete(`/users/me/addresses/${addressId}`, { withCredentials: true });
        toast.success("Address removed");
        return addressId;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
});

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        addresses: [],
        selectedAddress: null, // Yahan checkout ke liye select kiya hua address rahega
        loading: false,
        error: null
    },
    reducers: {
        setSelectedAddress: (state, action) => {
            state.selectedAddress = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAddressesAsync.pending, (state) => { state.loading = true; })
            .addCase(fetchAddressesAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.addresses = action.payload;
                // By default pehla address select kar lo agar hai toh
                // Sirf tab select karo jab pehle se koi select na ho (e.g. initial load par)
                if (action.payload.length > 0 && !state.selectedAddress) {
                    const defaultAddr = action.payload.find(a => a.isDefault);
                    state.selectedAddress = defaultAddr || action.payload[0];
                }
            })
            .addCase(addAddressAsync.fulfilled, (state, action) => {
                state.addresses.push(action.payload);
                if (action.payload.isDefault) state.selectedAddress = action.payload;
            })
            .addCase(deleteAddressAsync.fulfilled, (state, action) => {
                state.addresses = state.addresses.filter(a => a._id !== action.payload);
                if (state.selectedAddress?._id === action.payload) state.selectedAddress = null;
            });
    }
});

export const { setSelectedAddress } = addressSlice.actions;
export default addressSlice.reducer;