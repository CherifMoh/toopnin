"use client"

// import '../../../styles/pages/ledProductPage.css'

import axios from "axios";
import { useQuery } from '@tanstack/react-query';
import ProductsGrid from "../../../components/ProductsGrid"
import ProductsPage from "../../../components/led painting/LedPage"
import { Suspense } from "react";
import { notFound } from "next/navigation";
import ProductPSkelaton from "../../../components/loadings/ProductPSkelaton";





function Product({ params }) {
  async function fetchProducts() {
    const res = await axios.get(`/api/products/${params.productId}`);
    return res.data;
  }

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['product'],
    queryFn: fetchProducts
  });

  if (isLoading) return <div><ProductPSkelaton /></div>;

  if (isError) return <div>Error fetching products</div>;

  const mproduct = products[0]

  console.log(typeof products)

  if (typeof products !== 'object') {
    return notFound()
  }

  return (

    <main>

      <section className="main-section">
        <ProductsPage mproduct={mproduct} />
      </section>

      <section className="p-12">
        <ProductsGrid />
      </section>

    </main>
  )
}

export default Product