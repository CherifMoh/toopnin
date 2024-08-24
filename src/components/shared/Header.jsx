"use client"
import { useState } from 'react'
import '../../styles/shared/header.css'
import Link from 'next/link'
import Image from 'next/image'
import instaIcon from '../../../public/assets/Instagram.png'
import tiktokIcon from '../../../public/assets/tiktok.png'
import burger from '../../../public/assets/burger.png'
import logo from '../../../public/assets/logo.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useDispatch, useSelector } from 'react-redux'
import { showCartToggle } from '../../app/redux/features/showCart/showCartSlice'
import { faBagShopping } from '@fortawesome/free-solid-svg-icons'



function Header() {
  const [isSideShown, srtIsSideShown] = useState(false)

  const sideStyle = {
    translate: isSideShown ? '0px' : '-400px 0px '
  }
  const shadowStyle = {
    display: isSideShown ? 'block' : 'none'
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
      <div className="utility-bar">
        <div className="utility-bar--container">
          <div className="utility-bar--icons-container">
            <Link href="https://www.instagram.com/abdou_el_maknine/">
              <Image className="utility-bar--icons" width={76} height={76} src={instaIcon} alt='instagram icon' />
            </Link>
          </div>
          <h5 className='md:text-base text-sm'>
            Lorem ipsum / أسيا كثيرة اسبوعين
          </h5>
          <span>!</span>
        </div>
      </div>
      <header>
        {/* <Image onClick={handleSideToggel} src={burger} alt='' width={25} height={20} className="burger-button" />
        */}
        <div className='flex justify-center items-center'>
          <div className="utility-bar--container">
            <div onClick={handelCartToggle} className='cursor-pointer'>
              <FontAwesomeIcon icon={faBagShopping} className='w-5 h-5' />
            </div>
            <div className='w-20'>
              <Link href='/'>
                <Image src={logo} alt='Drawlys' className="header--logo" height={80} width={80} />
              </Link>
            </div>
            <div className='text-[#DCCCB3]'>.</div>
          </div>
        </div>
        {/* <div onClick={handleSideToggel} style={shadowStyle} className="side-menu-shadow z-20"></div>
        <div style={sideStyle} className="side-menu bg-[#DCCCB3] top-36">
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
        {/* <nav>
          <Link href="/led-painting">Luminous Frames</Link>
          <Link href="/faq">FAQS</Link>
          <Link href="/contact">Contact Us</Link>
        </nav> */}
      </header>
    </>
  )
}

export default Header