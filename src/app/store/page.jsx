
import '../../styles/pages/index.css'
import  ProductsGrid  from "../../components/ProductsGrid"
import  ProductGSkeleton  from "../../components/loadings/ProductGSkeleton"
import { Suspense } from 'react'


function Home() {
  return (
    <>
    <main className="main">
      <div className="main-container">
        <h1 className="text-4xl text-[#1a2332] font-bold mb-5">
          Luminous Frames
        </h1>            
        <ProductsGrid />   
      </div>
    </main>
    </>
  )
}

export default Home