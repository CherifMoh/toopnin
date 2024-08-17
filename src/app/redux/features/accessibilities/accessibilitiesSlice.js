"use client"

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  accessibilities: [],
}

export const accessibilitiesSlice = createSlice({
  name: 'accessibilities',
  initialState,
  reducers: {
    setAccessibilities: (state, action) => {
      state.accessibilities = action.payload;
    }
  },
})

export const { setAccessibilities } = accessibilitiesSlice.actions

export default accessibilitiesSlice.reducer
