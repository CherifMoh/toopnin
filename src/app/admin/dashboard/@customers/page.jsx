'use client'

import { useQuery } from "@tanstack/react-query";
import { DashboardCard, formatNumberWithCommas } from "../../../lib/utils";
import axios from "axios";
import Spinner from '../../../../components/loadings/Spinner'


function Sales() {
  async function fetchOrders() {
    const res = await axios.get('/api/orders');
    return res.data;
  }

  const { data: Orders, isLoading, isError,error } = useQuery({
    queryKey:['orders'],
    queryFn: fetchOrders
  });

  if (isLoading) return <DashboardCard
   title="Customers"
   body={<Spinner 
      color={'border-black'} 
      size={'w-8 h-8'} 
      containerStyle={'absolute top-1/2 left-1/2 translate-1/2'}
    />}
  />;
    
  if (isError) return <DashboardCard
   title="Customers"
   body={`Error: ${error.message}`}
  />;

  let totalPrice = 0 
  Orders.forEach(order => {
    totalPrice +=order.totalPrice
  }); 

  const averageValue = formatNumberWithCommas(Math.floor(totalPrice/Orders.length))

  return (
    <DashboardCard
      title="Customers"
      subtitle={`${averageValue} DA Average Value`}
      body={`${Orders.length} Customers`}
      />
  )
}

export default Sales