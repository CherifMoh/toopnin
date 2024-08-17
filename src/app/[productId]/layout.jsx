import Header from "../../components/shared/Header"
import Footer from "../../components/shared/Footer"
import BottomBar from '../../components/shared/BottomBar'
import dynamic from 'next/dynamic'

const Cart = dynamic(() => import('../../components/shared/Cart'), {
  ssr: false,
  loading: () => <p>Loading...</p>
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