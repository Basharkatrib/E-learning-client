import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    token: null,
    email: null
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
        },
        setEmail: (state, action) => {
            state.email = action.payload;
        },
    },
});

export const selectCurrentUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectEmail = (state) => state.auth.email;

export const { setCredentials, logout, setEmail } = authSlice.actions;
export default authSlice.reducer;
