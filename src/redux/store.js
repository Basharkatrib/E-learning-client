import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import themeReducer from './features/themeSlice';
import authReducer from './features/authSlice';
import translateSliceReducer from './features/translateSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiSlice } from './features/apiSlice';

const rootReducer = combineReducers({
  theme: themeReducer,
  auth: authReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  translate: translateSliceReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['theme', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  translate: translateSliceReducer,
});

export const persistor = persistStore(store);
export default store;
