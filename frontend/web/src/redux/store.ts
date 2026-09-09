import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import profileReducer from './slices/profileSlice'
import weatherReducer from './slices/weatherSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    weather: weatherReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
