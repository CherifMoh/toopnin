'use client'
// import '../styles/pages/index.css'

// import Header from '../components/home/Header'
// import Main from '../components/home/Main'
// import Footer from '../components/shared/Footer'
// import Cart from '../components/shared/Cart'
// import BottomBar from '../components/shared/BottomBar'
// import ProductsSlider from '../components/home/ProductsSlider'
// import Image from 'next/image'
// import brownSide from '../../public/assets/brownSide.png'
// import blueSide from '../../public/assets/blueSide.png'
import { useRouter } from 'next/navigation'


function Home() {
  const router = useRouter()
  router.push('/store')

  return (
    <></>
    // <div className='overflow-x-hidden'>
    //   <Header />
    //   <Main />
    //   <section className='md:mt-8 mt-4 relative'>
    //     <h1
    //       className='md:text-5xl text-4xl font-bold text-center mb-4'
    //     >
    //       اكتشف كل منتجاتنا

    //     </h1>
    //     <Image
    //       src={blueSide} alt=''
    //       height={120} width={120}
    //       className='absolute -top-16 -left-20'
    //     />
    //     <Image
    //       src={brownSide} alt=''
    //       height={120} width={120}
    //       className='absolute -top-6 -right-16'
    //     />
    //     <ProductsSlider />
    //   </section>
    //   <Cart />
    //   <Footer />
    //   <BottomBar />
    // </div>
  )
}

export default Home