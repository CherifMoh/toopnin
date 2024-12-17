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
   title="Sales"
   body={<Spinner 
      color={'border-black'} 
      size={'w-8 h-8'} 
      containerStyle={'absolute top-1/2 left-1/2 translate-1/2'}
    />}
  />;
    
  if (isError) return <DashboardCard
   title="Sales"
   body={`Error: ${error.message}`}
  />;

  let totalPrice = 0 
  Orders.forEach(order => {
    totalPrice +=order.totalPrice
  }); 

  let totalQnt= 0 
  Orders.forEach(order => {
    order.orders.forEach(item => {
      totalQnt+=Number(item.qnt)
    });
  });

  let confTotalQnt= 0 
  Orders.forEach(order => {
    
    if(
      order.tracking === 'Livrée' || 
      order.tracking === 'Livrée [ Encaisser ]' || 
      order.tracking === 'Livrée [ Recouvert ]'
    ){
    order.orders.forEach(item => {
      
      confTotalQnt+=Number(item.qnt)
    });}
  });

  

  return (
    <DashboardCard
      title="Sales"
      subtitle={`${totalQnt} Orders`}
      // body={`${formatNumberWithCommas(totalPrice)} DA`}
      body={`delivered ${confTotalQnt} Orders`}
    />
  )
}

export default Sales