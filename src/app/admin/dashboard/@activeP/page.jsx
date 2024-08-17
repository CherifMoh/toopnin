'use client'

import { useQuery } from "@tanstack/react-query";
import { DashboardCard, formatNumberWithCommas } from "../../../lib/utils";
import axios from "axios";
import Spinner from '../../../../components/loadings/Spinner'


function Sales() {
  async function fetchProducts() {
    const res = await axios.get('/api/products');
    return res.data;
  }

  const { data: Products, isLoading, isError,error } = useQuery({
    queryKey:['Products admin dashboard'],
    queryFn: fetchProducts
  });

  if (isLoading) return <DashboardCard
   title="Active Products"
   body={<Spinner 
      color={'border-black'} 
      size={'w-8 h-8'} 
      containerStyle={'absolute top-1/2 left-1/2 translate-1/2'}
    />}
  />;
    
  if (isError) return <DashboardCard
   title="Active Products"
   body={`Error: ${error.message}`}
  />;

 
    const inactiveProducts = Products.filter(product => !product.active).length

  return (
    <DashboardCard
      title="Active Products"
      subtitle={`${inactiveProducts} Inactive`}
      body={Products.length}
    />
  )
}

export default Sales