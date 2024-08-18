import { getOneProduct } from "../../actions/product"

export async function generateMetadata({ params }) {
  try {

    const product = await getOneProduct(params.productId)

    return {
      title: product.title,
    }

  }catch(err){
    return {
      title : 'Error'
    }
  }
 
}

export default function Layout({ children }) {
  return (
    <>
      {children}
    </>

  )
}