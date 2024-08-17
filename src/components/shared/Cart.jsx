"use client"

import '../../styles/shared/cart.css'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeProduct, updatedQuntity } from '../../app/redux/features/cart/cartSlice'
import { showCartToggle } from '../../app/redux/features/showCart/showCartSlice'
import { setTotalPrice } from '../../app/redux/features/totalePrice/totalePrice'

import axios from "axios";
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link'
import Image from 'next/image'
import shoppingBag from '../../../public/assets/shopping-bag.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'


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

function Cart() {

  const [isCartEmpty, setIsCartEmpty] = useState(true)

  const cart = useSelector((state) => state.cart.cart)

  const isCartShown = useSelector((state) => state.isCartShown.isCartShown)

  const totalPriceState = useSelector((state) => state.totalPrice.totalPrice)


  const cartStyle = {
    translate: isCartShown ? `0px` : `440px 0px`
  }

  const cartShadowStyle = {
    display: isCartShown ? `block` : `none`
  }

  const bodyClass = typeof document !== 'undefined' && document.body.classList
  if (bodyClass) isCartShown
    ? bodyClass.add('overflow-hidden')
    : bodyClass.remove('overflow-hidden');

  let totalPrice = 0
  cart.forEach(cartItem => {
    let sales;
    let isSales = false;
    for (let i = 0; i < cartItem.sales.length; i++) {
      const sale = cartItem.sales[i];
      if (Number(sale.qnt) === cartItem.qnt) {
        isSales = true;
        sales = sale.percen
        break; // Exit the loop since the condition is met
      }
    }
    totalPrice += sales ? (cartItem.price - (cartItem.price * sales) / 100) * cartItem.qnt : cartItem.price * cartItem.qnt
  })

  const totalQnt = cart.reduce((acc, cartItem) => acc + cartItem.qnt, 0);

  const { data: products, isLoading, isError } = useQuery({
    queryKey: cart.map(cartItem => cartItem._id),
    queryFn: (queryKey) => fetchProducts(queryKey.queryKey)
  });

  useEffect(() => {
    if (totalQnt > 0) {
      setIsCartEmpty(false)
    } else {
      setIsCartEmpty(true)
    }
  }, [totalQnt])

  useEffect(() => {
    handelTotalPrice(totalPrice)
  }, [totalPrice])

  const dispatch = useDispatch();
  if (!cart) return 0

  const handleUpdateCart = (productId, qnt) => {
    dispatch(updatedQuntity({
      _id: productId,
      qnt: qnt,
    }));
  };

  const handleRemoveCartItem = (productId) => {
    dispatch(removeProduct({
      _id: productId,
    }));
  };

  const handelCartToggle = () => {
    dispatch(showCartToggle());
  }

  const handelTotalPrice = (price) => {
    dispatch(setTotalPrice({
      price: price
    }));
  }
  typeof localStorage !== 'undefined' && localStorage.setItem('cart', JSON.stringify(cart));

  if (isLoading) return console.log('Loading...');
  if (isError) return console.log("Error fetching products");


  const cartItemsElements = cart.map(cartItem => {
    let product

    products.forEach(p => {
      if (p._id === cartItem._id) {
        product = p
      }
    })

    if (cartItem.qnt === 0) {
      handleRemoveCartItem(cartItem._id)
    }

    let isSales = false;
    let sales;

    for (let i = 0; i < cartItem.sales.length; i++) {
      const sale = cartItem.sales[i];
      if (Number(sale.qnt) === cartItem.qnt) {
        isSales = true;
        sales = sale.percen
        break; // Exit the loop since the condition is met
      }
    }

    let price = cartItem.price
    cartItem.options?.forEach(option => {
      if (option.selected) {
        price = option.price
      }
    })

    return (
      <div
        key={cartItem._id + cartItem.option}
        className="cart-item-container flex items-center relative"
      >
        <div className="cart-item-img-container">
          <Image
            src={product.imageOn}
            className="cart-item-Image"
            width={60} height={60} alt={product.title}
          />
        </div>
        <div className="cart-item-info-container">
          <div className="cart-item-top-row">
            <div className="cart-item-title">{product.title}</div>
            <div
              className="cart-item-trash z-20 flex items-center justify-center cart-off font-extralight hover:bg-gray-100 rounded-md"
              data-product-id={product._id}
              onClick={() => handleRemoveCartItem(product._id)}
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </div>
          </div>
          <div className="cart-item-lower-row">
            <div className="cart-item-quantity-container z-20">
              <button
                className="cart-item-minus-button"
                data-product-id={cartItem._id}
                onClick={() => {
                  if (cartItem.qnt >= 1) {
                    handleUpdateCart(product._id, cartItem.qnt - 1)
                  }
                }
                }

              >
                -
              </button>
              <input
                className="cart-item-quantity-input"
                data-product-id={cartItem._id}
                value={cartItem.qnt} min="1"
                type="text"
                onChange={(e) => handleUpdateCart(product._id, e.target.value)}
              />
              <button
                className="cart-item-plus-button"
                data-product-id={cartItem._id}
                onClick={() => handleUpdateCart(product._id, cartItem.qnt + 1)}
              >+</button>
            </div>
            <div className="cart-item-price-container">
              <div className="cart-item-price">
                {isSales &&
                  <span className="cart-item-befor-price">
                    {price * cartItem.qnt}
                  </span>
                }
                <span className="cart-item-after-price" >
                  {sales ? (price - (price * sales) / 100) * cartItem.qnt : price * cartItem.qnt}DA
                </span>
              </div>
              {isSales &&
                <div className="text-green-600 ">
                  <span className="font-medium">
                    (Save {(price) * cartItem.qnt - (price - (price * sales) / 100) * cartItem.qnt}DA)
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
        <a
          href='/cart'
          className='w-full h-full absolute top-0 left-0 cursor-pointer'
        ></a>
      </div>
    )
  });


  return (
    <>
      <div onClick={handelCartToggle} className="cart-button-container ">
        <Image
          className="cart-shopping-bag"
          src={shoppingBag}
          width={64} height={64} alt=""
        />
        <span className="cart-button-quntity-number">{totalQnt}</span>
      </div>
      <div
        style={cartShadowStyle}
        className='bg-black fixed left-0 top-0 h-screen w-full opacity-40'
        onClick={handelCartToggle}
      >
      </div>
      <div style={cartStyle} className="cart-container ">
        <div className="cart-header">
          <a className='text-3xl font-semibold' href='/cart'>Cart • {totalQnt}</a>
          <button onClick={handelCartToggle} className="cart-off font-extralight bg-gray-100">X</button>
        </div>
        <div className="cart-items"  >
          {cartItemsElements}
        </div>
        {isCartEmpty
          ?
          <h1 className='text-2xl text-black font-semibold text-center mt-52'>Your cart is empty</h1>
          :
          <a href="/checkout">
            <button className="cart-checkout">
              Checkout • <span className="checkout-price">{totalPriceState}</span> DA
            </button>
          </a>

        }

      </div>
    </>
  )
}

export default Cart