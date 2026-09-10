import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'
import profileReducer from './slices/profileSlice'
import recordsReducer from './slices/recordsSlice'
import trackingReducer from './slices/trackingSlice'
import weatherReducer from './slices/weatherSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    profile: profileReducer,
    records: recordsReducer,
    tracking: trackingReducer,
    weather: weatherReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
