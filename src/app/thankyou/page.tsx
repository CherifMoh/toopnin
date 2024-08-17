'use client'
import Image from 'next/image'

import lines from '../../../public/assets/thankYou/lines.png'
import logoDown from '../../../public/assets/thankYou/logoDown.png'
import logoUP from '../../../public/assets/thankYou/logoUp.png'
import phone from '../../../public/assets/thankYou/phone.png'
import shareArrow from '../../../public/assets/thankYou/shareArrow.png'
import wave from '../../../public/assets/thankYou/wave.png'
import emailIcon from '../../../public/assets/thankYou/emailIcon.png'
import instagramIcon from '../../../public/assets/thankYou/instagram.png'
import phoneIcon from '../../../public/assets/thankYou/phoneIcon.png'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function Thank() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set isVisible to true after a certain delay or any other condition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  const socialArray = [
    { icon: emailIcon, name: 'drawlys@gmail.com', link: 'mailto:' },
    { icon: phoneIcon, name: '055555555', link: 'tel:+213' },
    { icon: instagramIcon, name: 'drawlys_deco', link: 'https://www.instagram.com/' },
  ]

  const socialElements = socialArray.map(social => (
    <Link
      href={social.link + social.name}
      className='flex lg:justify-center lg:gap-0 gap-2 justify-end items-center w-1/4 hover:underline'
      key={social.name}
    >
      <div
        className='text-2xl'

      >
        {social.name}
      </div>
      <Image
        src={social.icon} alt=''
        width={400} height={300}
        className='w-auto lg:h-22 h-8 lg:translate-x-12 lg:mr-14'
      />
    </Link>
  ))

  return (
    <>
      <div className='flex overflow-hidden'>
        <Image
          src={lines}
          alt=''
          width={1080}
          height={500}
          className={`h-3/4 w-1/3 ${isVisible
            ? 'opacity-100 transition duration-500 transform translate-y-0 translate-x-0'
            : 'opacity-0 -translate-y-3/4 -translate-x-3/4'}
          `}
        />

        <Image
          src={phone} alt=''
          width={1080} height={500}
          className={`h-auto w-1/3 sm:-translate-x-12 -translate-x-6 ${isVisible
            ? 'opacity-100 transition duration-500 transform translate-y-16 sm:translate-y-16 md:translate-y-28 lg:translate-y-52 '
            : 'opacity-0 translate-y-[500px]'}
          `}
        />
        <Image
          src={logoUP} alt=''
          width={1080} height={500}
          className={`h-3/4 w-1/3 ${isVisible
            ? 'opacity-100 transition duration-500 transform translate-y-16 sm:translate-y-24 md:translate-y-40 lg:translate-y-80 translate-x-0'
            : 'opacity-0 translate-y-3/4 translate-x-1/4'}
        `}
        />

      </div>

      <div>
        <Image
          src={wave} alt=''
          width={1080} height={1920}
          className='h-full w-full'
        />
      </div>

      <div className='flex-col w-full items-center overflow-hidden h-screen'>

        <div className='flex flex-col lg:flex-row w-full items-center justify-evenly px-24'>
          <Image
            src={logoDown} alt=''
            width={400} height={300}
            className='w-auto h-12  hidden lg:block translate-y-28'
          />

          <a
            className='bg-white whitespace-nowrap w-min wr text-4xl py-4 px-6 rounded-full font-semibold flex items-center'
            style={{
              boxShadow: 'rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset'
            }}
            href={'/'}
          >
            تصفح منتجاتنا مجددا
          </a>

          <div className='text-center flex items-center gap-3 justify-center translate-y-20'>
            <Image
              src={shareArrow} alt=''
              width={400} height={300}
              className='h-12 w-auto'
            />
            <p className='text-3xl hidden lg:block leading-[60px]'>
              شارك الموقع مع
              <br />
              أصدقائك وعائلتك
            </p>
          </div>

          <Image
            src={logoUP} alt=''
            width={1080} height={500}
            className={`md:h-3/4 md:w-1/3 translate-y-40  lg:hidden transition duration-500 transform `}
          />
        </div>

        <h1 className='w-full text-end text-3xl underline underline-offset-8 lg:px-24 pr-4 lg:mt-80 sm:mt-48 mt-64 font-semibold'>
          :
          تواصلوا معنا عبر

        </h1>

        <div className='flex flex-col lg:flex-row lg:gap-0 gap-5 justify-between lg:items-center items-end mt-12 lg:px-24 pr-4 '>
          {socialElements}
        </div>
      </div>
    </>
  )
}

export default Thank