import Header from "../../components/shared/Header"
import Footer from "../../components/shared/Footer"
import dynamic from 'next/dynamic'
import BottomBar from '../../components/shared/BottomBar'

const Cart = dynamic(() => import('../../components/shared/Cart'), {
  ssr: false,
  // loading: () => <p>Loading...</p>
})


export const metadata = {
  title: 'Led Painting',
}

export default function Layout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Cart />
      <BottomBar />
      <Footer />
    </>

  )
}