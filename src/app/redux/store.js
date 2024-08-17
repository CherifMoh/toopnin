"use client"

import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import showCartReducer from './features/showCart/showCartSlice'
import totalPriceReducer from './features/totalePrice/totalePrice'
import accessibilitiesReducer from './features/accessibilities/accessibilitiesSlice'
import otpReducer from './features/otp/otpSlice'
import emailReducer from './features/email/emailSlice'



export const store = configureStore({
  reducer: {
    cart:cartReducer,
    isCartShown:showCartReducer,
    totalPrice:totalPriceReducer,
    accessibilities: accessibilitiesReducer,
    otp: otpReducer,
    email: emailReducer,
  },
})