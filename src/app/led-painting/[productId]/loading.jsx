import  ProductPSkelaton from "../../../components/loadings/ProductPSkelaton";
import  ProductGSkelaton from "../../../components/loadings/ProductGSkeleton";


function Product() {

  return (
    
    <main>

      <section className="main-section">
        <ProductPSkelaton/>
      </section> 
      
      <section className="main-container2 p-12"> 
          <ProductGSkelaton />          
      </section>

    </main>
  )
}

export default Product