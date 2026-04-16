import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, productAPI, cartAPI, orderAPI } from '../../api/axios';

// Register Action
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
    try {
        const response = await authAPI.post('/register', userData);
        return response.data; // Backend cookie set kar dega automatically
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Registration Failed");
    }
});

// Login Action
export const loginUser = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
    try {
        const response = await authAPI.post('/login', userData);
        return response.data; // Backend response mein user info bhejega, token cookie mein jayega
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Login Failed");
    }
});

// 1. Refresh hone par User load karne ke liye (/me route)
export const loadUser = createAsyncThunk('auth/loadUser', async (_, thunkAPI) => {
    try {
        const response = await authAPI.get('/me'); // Aapka backend route
        return response.data; // User object {username, email, fullName...}
    } catch (error) {
        return thunkAPI.rejectWithValue(null);
    }
});

// 2. Logout Action
export const logoutUser = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
    try {
        await authAPI.get('/logout');
        return null;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response.data.message);
    }
});

// Add New Address Action
export const addUserAddress = createAsyncThunk('auth/addAddress', async (addressData, thunkAPI) => {
    try {
        const response = await authAPI.post('/users/me/addresses', addressData);
        return response.data.addresses; // Backend updated addresses array bhejega
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add address");
    }
});

// Delete Address Action
export const deleteAddress = createAsyncThunk('auth/deleteAddress', async (addressId, thunkAPI) => {
    try {
        const response = await authAPI.delete(`/users/me/addresses/${addressId}`);
        return response.data.addresses;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete address");
    }
});


const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('user'),
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true; // Register ke baad agar auto-login hai toh
                state.error = null;

                // Backend se payload mein { message, user, token } aana chahiye
                const userData = action.payload.user ? {
                    ...action.payload.user,
                    token: action.payload.token // <--- Register wala token bhi yahan save ho gaya
                } : action.payload;

                state.user = userData;
                localStorage.setItem('user', JSON.stringify(userData));
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.error = null;

                // Backend se payload mein { message, user, token } aa raha hai
                // Hum token ko user object ke andar ghusa dete hain storage ke liye
                const userData = action.payload.user ? {
                    ...action.payload.user,
                    token: action.payload.token // <--- Token yahan save ho gaya
                } : action.payload;

                state.user = userData;
                localStorage.setItem('user', JSON.stringify(userData));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload; // Ye UI par error dikhayega
            })
            // --- LOAD USER CASES ---
            .addCase(loadUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;

                // Agar loadUser ( /me ) token nahi bhejta, toh purana token retain karo
                const currentToken = state.user?.token;
                const newUser = action.payload.user || action.payload;

                state.user = { ...newUser, token: currentToken };
                localStorage.setItem('user', JSON.stringify(state.user));
            })
            .addCase(loadUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;

                localStorage.removeItem('user');
            })
            // Logout Case
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;

                localStorage.removeItem('user');

            })

            // Add Address
            .addCase(addUserAddress.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.addresses = action.payload; // Store mein addresses update
                }
            })
            // Delete Address
            .addCase(deleteAddress.fulfilled, (state, action) => {
                if (state.user) {
                    state.user.addresses = action.payload;
                }
            });
        // ... baki pending aur rejected cases same rahenge
    }
});

export default authSlice.reducer;


// export const { logout } = authSlice.actions;
//  reducers: {
//         logout: (state) => {
//             state.user = null;
//             state.isAuthenticated = false;
//         }
//     }