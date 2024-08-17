'use client'

import logo from '../../../public/assets/phoneLogo.png'
import burger from '../../../public/assets/burger.png'
import instaIcon from '../../../public/assets/Instagram.png'
import tiktokIcon from '../../../public/assets/tiktok.png'
import shoppingBag from '../../../public/assets/shopping-bag.png'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faBagShopping } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showCartToggle } from '../../app/redux/features/showCart/showCartSlice'

import '../../styles/shared/header.css'


function Header() {

  const [isSideShown, srtIsSideShown] = useState(false)

  const sideStyle = {
    translate: isSideShown ? '0px' : '-400px 0px '
  }


  function handleSideToggel() {
    srtIsSideShown(pre => !pre)
  }

  const dispatch = useDispatch();

  const handelCartToggle = () => {
    dispatch(showCartToggle());
  }

  return (
    <>
      {/* <div
        onClick={handleSideToggel}
        className={`${isSideShown ? 'block' : 'hidden'} bg-black fixed opacity-40 top-24 left-0 z-20 w-screen h-screen `}
      ></div>
      <div
        style={sideStyle}
        className="side-menu bg-[#F5F5F5] top-24"
      >
        <section className="side-menu--top">
          <Link href="/led-painting" className='text-gray-900'>Luminous Frames</Link>
          <Link href="/faq" className='text-gray-900'>FAQS</Link>
          <Link href="/contact" className='text-gray-900'>Contact Us</Link>
        </section>
        <section className="side-menu--low">
          <Link href="https://www.instagram.com/drawlys_deco/">
            <Image className="utility-bar--icons" alt='' width={76} height={76} src={instaIcon} />
          </Link>
          <Link href="https://www.instagram.com/drawlys_deco/">
            <Image className="utility-bar--icons" alt='' width={76} height={76} src={tiktokIcon} />
          </Link>
        </section>
      </div> */}
      <div className='bg-[#f5f5f5] flex md:justify-evenly justify-between md:p-0 p-4 items-center w-full h-24'>

        {/* <div className='md:hidden flex items-center justify-center'>
          <Image
            src={burger} alt=''
            width={80} height={80}
            className='h-6 w-auto md:hidden'
            onClick={handleSideToggel}
          />
        </div>
        <nav className='hidden md:flex w-[394px]'>
          <Link href="/led-painting">Luminous Frames</Link>
          <Link href="/faq">FAQS</Link>
          <Link href="/contact">Contact Us</Link>
        </nav> */}

        <div onClick={handelCartToggle} className=" md:w-[394px] text-center">
          <FontAwesomeIcon icon={faBagShopping} className='w-5 h-5' />
        </div>

        <div className='md:w-[394px] flex items-center justify-center'>`
          <Link href={'/'}>
            <Image
              src={logo} alt=''
              width={80} height={80}
              className='h-14 w-auto'
            />
          </Link>
        </div>

        <div className='relative md:w-[394px] flex items-center justify-center'>
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className='md:absolute right-24 md:pr-8 top-1 h-4 w-4'
          />
          <input
            type='search'
            className='hidden md:block border border-black rounded-full'
          />
        </div>

      </div>
    </>
  )
}

export default Header