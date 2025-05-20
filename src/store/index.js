import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // localStorage uchun
import userReducer from './userSlice'
import themeReducer from './themeSlice'

// Root reducer yaratamiz
const rootReducer = combineReducers({
  user: userReducer,
  theme: themeReducer
})

// Persist konfiguratsiya
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', "theme"], // faqat 'user' slice saqlanadi
}

// Persist qilingan reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Store yaratish
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist objectlarni tekshiradi, shuning uchun bu false
    }),
})

// Persistor export qilamiz
export const persistor = persistStore(store)
