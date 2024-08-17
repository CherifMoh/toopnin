"use client"

import { createSlice } from '@reduxjs/toolkit'


const initialState = {
    totalPrice: 0 ,
}


export const totalPriceSlice = createSlice({
  name: 'totalPrice',
  initialState,
  reducers: {
    setTotalPrice: (state, action) => {
        return {...state,totalPrice :action.payload.price}
    },
  },
})

  
export const { setTotalPrice} = totalPriceSlice.actions

export default totalPriceSlice.reducer