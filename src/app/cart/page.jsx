'use client'

import Image from "next/image";
import { useDispatch, useSelector } from "react-redux"
import '../../styles/pages/checkout.css'
import '../../styles/pages/ledProductPage.css'
import logo from '../../../public/assets/logo.png' 
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { updatedQuntity, updatedOptions, removeProduct } from "../redux/features/cart/cartSlice";
import Link from "next/link";
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'


function CartPage() {

  typeof document !== 'undefined' && document.body.classList.add('bg-white')
  typeof document !== 'undefined' && document.body.classList.add('overflow-x-hidden')

  async function fetchProducts(idArray) {
    try {
      const promises = idArray.map(async id => {
        const res = await axios.get(`/api/products/${id}`);
        return res.data[0];
      });
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  const cart = useSelector((state) => state.cart.cart)

  const [totalePrice, setTotalPrice] =useState(0)
  
  const totalPriceState = useSelector((state) =>state.totalPrice.totalPrice)
  
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: cart.map(cartItem => cartItem._id),
    queryFn: (queryKey) => fetchProducts(queryKey.queryKey)
  });


  const dispatch = useDispatch();
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  
  // console.log(subTotalPriceState)

  const handleUpdateCartQnt = (productId, qnt) => {
    dispatch(updatedQuntity({
      _id: productId,
      qnt: qnt,
    }));
  };

  const handleUpdateCartOpt = (productId, selectedTitle, cartItem) => {
    const newOption = cartItem.options.map(preOption=>{

      if(preOption.selected){
        return {...preOption,selected:false}
      }
      if(selectedTitle === preOption.title){
        return {...preOption,selected:true}
      }
      return preOption

    })
    console.log(newOption)
    dispatch(updatedOptions({
      _id: productId,
      options: newOption,
    }));
  };

  const handleRemoveCartItem = (productId) => {
    dispatch(removeProduct({
      _id: productId,
    }));
  };

  

  localStorage.setItem('cart',JSON.stringify(cart))

  let totalPrice = 0
  const cartItems = cart.map((cartItem)=>{

    let beforePrice = cartItem.price  
    let sales
    let isSales = false

    

    const optionsElement = cartItem.options?.map(option=>{
      if(option.selected){
        beforePrice = option.price
      }
      const buttonStyle={
        boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset'
      }

      return(
          <button 
           className={`flex transition-all justify-center items-center gap-4 px-4 py-2 rounded-full ${option.selected?'bg-zinc-300 ':'bg-zinc-100'}` }
           style={buttonStyle}
           key={option.title} 
           onClick={()=>handleUpdateCartOpt(cartItem._id, option.title, cartItem)}
          >
              <img
               src={option.image}
               alt=''
               width={100} height={100}
               className='w-4'
              />
              <div className='flex flex-col justify-center items-center'>
                  <span className='price-after-sale text-sm'>{option.title}</span>
                  <span className='price-after-sale text-sm'>{option.price} DA</span>
              </div>
          </button>
      )
    })

    cartItem.sales.forEach(sale => {
      if(Number(sale.qnt) <= cartItem.qnt){
        sales = sale.percen
        isSales = true
      }
    });
    
    let product 

    products.forEach(p=>{
      if(p._id === cartItem._id ){
        product = p
      }
    })

    totalPrice += sales?(beforePrice-(beforePrice*sales)/100)*cartItem.qnt:beforePrice*cartItem.qnt

    return(
      <div 
       key={cartItem._id}
       className="flex md:flex-row flex-col items-center 2xl:min-w-[1000px] lg:min-w-[800px] md:min-w-[600px] sm:w-[300px] w-[200px] relative border-[1px] h-auto lg:h-56 border-gray-400 rounded-lg py-4 px-6 bg-gray-100"
      >
        <img 
         src={product.imageOn} 
         className="rounded-lg h-36 w-36 xl:h-48 xl:w-48" 
         width={190} height={190} 
         alt={product.title}
        />
        <div className="md:ml-8 py-2 flex flex-col items-center md:items-start justify-between">
          <span className='text-lg mb-2'>
            {product.title}
          </span> 
          <div className="flex mb-4 gap-1 flex-col lg:flex-row">
            {optionsElement}
          </div>  
          <div className="quantity-container flex">
            <button
                className="minus-quantity-button flex items-start justify-center"
                onClick={() =>{
                  if(cartItem.qnt > 1){
                    handleUpdateCartQnt(cartItem._id,cartItem.qnt-1)
                  }
                }}
            >
                _
            </button>
            <div
                className="quantity-input text-center flex items-center justify-center"
            >{cartItem.qnt}</div>
            <button
                className="plus-quantity-button pb-1"
                onClick={() =>{                           
                  handleUpdateCartQnt(cartItem._id,cartItem.qnt+1)                       
                }}
            >
                +
            </button>
          </div>        
        </div>
        <div 
         className="ml-auto mr-4 m-auto font-semibold text-2xl"
         style={{fontFamily: 'DM Serif Display , serif '}}
        >
          <div className="cart-item-price text-center">
            {isSales&&
              <span className="opacity-60 line-through mr-2">
                {beforePrice *cartItem.qnt}
              </span>
            }
            <span className="text-center" >
              {sales?(beforePrice-(beforePrice*sales)/100)*cartItem.qnt:beforePrice*cartItem.qnt }DA
            </span>
            </div>
        </div>
        <div className='cursor-pointer absolute top-3 right-3' onClick={()=>handleRemoveCartItem(cartItem._id)}>
          <FontAwesomeIcon  icon={faTrashCan} />
        </div>
      </div>
    )
    
  })
  const cartTitles = cart.map(cartItem=>{
    let product 

    products.forEach(p=>{
      if(p._id === cartItem._id ){
        product = p
      }
    })
    return(
      <div 
       key={product.title}
       className='text-lg'
      >
        {product.title}
      </div>
    )
  })


  return (
    <div> 
      <header className='flex  items-center justify-center bg-white'>
        <a href="/led-painting" className="logo-container w-24 block">
            <Image alt='' src={logo} width={80} height={80} className="logo" />
        </a>
      </header>
      <div className="flex w-screen justify-evenly 2xl:p-16 xl:p-12 ">     
        <section className="bg-white ml-4">
          <div className="h-full w-full">
            <h1 
             style={{fontFamily: 'DM Serif Display , serif '}} 
             className='text-center font-bold md:text-5xl sm:text-4xl text-3xl mb-4'
            >
              Your Cart
            </h1>
            <div className="flex flex-col gap-14">
              {cartItems}
            </div>

          </div>
        </section>
        <section>
          <h1 
             style={{fontFamily: 'DM Serif Display , serif '}} 
             className='text-center font-bold md:text-5xl sm:text-4xl text-3xl mb-4'
          >Subtotal</h1>
          <div 
           className="border-gray-400 border-[1px] relative rounded-lg py-4 xl:px-6 px-3 bg-gray-100 h-96 xl:w-[400px] md:w-64"
          >
            <div 
             className='text-lg font-semibold mb-3'
            >
              Order
            </div>

            <div className="flex flex-col justify-between h-2/4">
              <div className="flex flex-col xl:flex-row justify-between xl:items-center">
                <div>{cartTitles}</div>
                <div className="text-lg xl:text-left text-center my-3 xl:my-0">{totalPrice} DA</div>
              </div>
              <div className="flex flex-col xl:flex-row justify-between xl:items-center text-xl">
                <div>Shipping :</div>
                <div>سيتم تحديد السعر عند الدفع</div>
              </div>
            </div>

            <a
              className='absolute bottom-4 xl:w-80 w-28 left-10 md:left-20 xl:left-12 bg-black text-center py-1 rounded-lg text-white'
              href="/checkout"
            >
              Checkout

            </a>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CartPage