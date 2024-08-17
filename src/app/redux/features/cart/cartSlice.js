"use client"

import { createSlice } from '@reduxjs/toolkit'


const initialState = {
  cart: typeof localStorage !== 'undefined' && localStorage.getItem('cart') !=='' ? JSON.parse(localStorage.getItem('cart')) || [] : [],
};


export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const cart = state.cart;
      const matchingItem = cart.find(item => {
        return(item._id === action.payload._id && item.option === action.payload.option)
      });
      
      if (matchingItem) {
          const updatedCart = cart.map(item => {
              if (item._id === matchingItem._id) {
                  return { ...item, qnt: item.qnt + Number(action.payload.qnt) };
              }
              return item;
          });
          
          return { ...state, cart: updatedCart };
      } else {
          return { 
            ...state,
            cart: [...cart, 
                    { _id:action.payload._id, 
                      qnt: action.payload.qnt, 
                      price:action.payload.price,
                      options:action.payload.options,
                      sales:action.payload.sales
                    }] };
      }
  },
    removeProduct: (state, action) => {
    let cart = state.cart
    const updatedCart = cart.filter(item => item._id !== action.payload._id);
    return  { ...state, cart: updatedCart }
  },
    emptyCart: (state, action) => {
    const updatedCart = [];
    return  { ...state, cart: updatedCart }

  },
    updatedQuntity:(state, action)=>{

    let cart = state.cart

    const updatedCart = cart.map(cartItem=>{

      if(cartItem._id === action.payload._id){

        return {...cartItem, qnt:action.payload.qnt}

      }else{

        return cartItem
      }
    })
    return { ...state, cart: updatedCart }
  },
    updatedOptions:(state, action)=>{

    let cart = state.cart

    const updatedCart = cart.map(cartItem=>{

      if(cartItem._id === action.payload._id){

        return {...cartItem, options:action.payload.options}

      }else{

        return cartItem
      }
    })
    return { ...state, cart: updatedCart }
  }
  },
})

  
export const { addProduct, removeProduct, emptyCart, updatedQuntity, updatedOptions } = cartSlice.actions

export default cartSlice.reducer