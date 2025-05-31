import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage uchun
import userReducer from './userSlice';
import themeReducer from './themeSlice';
import orderReducer from './orderSlice'; 

// Root reducer yaratamiz
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer,
  order: orderReducer, 
});

// Persist konfiguratsiya
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'theme'], // Order state'ni saqlash shart emas, chunki u dinamik yuklanadi
};

// Persist qilingan reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store yaratish
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Persistor export qilamiz
export const persistor = persistStore(store);