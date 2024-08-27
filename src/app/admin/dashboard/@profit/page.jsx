'use client'

import { useQuery } from "@tanstack/react-query";
import { DashboardCard, formatNumberWithCommas } from "../../../lib/utils";
import axios from "axios";
import Spinner from '../../../../components/loadings/Spinner'
import { useState } from "react";

async function fetchProducts() {
  const res = await axios.get('/api/products');
  return res.data;
}

const fetchOrders = async (filters) => {
  
    const res = await axios.get(`/api/orders?date=${filters.date}&startDate=${filters.startDate}&endDate=${filters.endDate}`);
    return res.data;
  };

function Profit() {

    const [selectedProduct, setSelectedProduct] = useState('')
    const [selectedDate, setSelectedDate] = useState('')
    const [cost, setCost] = useState('')
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [profit, stProfit] = useState();
  

  const { data: Products, isLoading, isError,error } = useQuery({
    queryKey:['Products admin dashboard'],
    queryFn: fetchProducts
  });

  const filter = {
    date: selectedDate,
    startDate: startDate || '',
    endDate: endDate || '',
  }

  const { data: Orders, isLoading: isLoadingOrders, isError:isOrdersError, error:ordersError } = useQuery({
    queryKey: ['orders',filter],
    queryFn: ({queryKey})=>fetchOrders(queryKey[1]),
    // enabled: !!selectedDate,
});

 
  if (isLoading || isLoadingOrders) return <DashboardCard
   title="Profit calculator"
   body={<Spinner 
      color={'border-black'} 
      size={'w-8 h-8'} 
      containerStyle={'absolute top-1/2 left-1/2 translate-1/2'}
    />}
  />;
    
  if (isError) return <DashboardCard
   title="Profit calculator"
   body={`Error: ${error.message}`}
  />;
  if (isOrdersError) return <DashboardCard
   title="Profit calculator"
   body={`Error: ${ordersError.message}`}
  />;


  function calculateProfit() {
    const livredOrders = Orders.filter(order => order.tracking === 'Livrée [ Encaisser ]' || order.tracking === 'Livrée');
    const returnedOrders = Orders.filter(order => order.tracking === 'Retour Livreur' || order.tracking === 'Retour de Dispatche' || order.tracking === 'Retour Navette');
    
    let ordersProfit =0
  
    livredOrders.forEach(order => {
      let orderProfit = Number(order.totalPrice) - Number(order.shippingPrice)
      order.orders.forEach(product => {
          
          if(product.productID === selectedProduct){
            product.qnts.forEach(qnt => {
              orderProfit -=Number(qnt.qnt) * Number(qnt.price)
            })
          }
      })
      ordersProfit += Number(orderProfit)
    });
  
    stProfit( ordersProfit - Number(cost) - Number(returnedOrders.length * 150))
  }


  const productsOptionsElement = Products.map(product => {
    return <option key={product._id} value={product._id}>{product.title}</option>
  })
  
  const productsSelectElement = [
    <select 
        name="product" 
        value={selectedProduct}
        className=" w-1/4 py-2 px-4 bg-transparent border border-gray-200 rounded-md"
        onChange={e => setSelectedProduct(e.target.value)}
    >
        <option hidden>اختر المنتج</option>
        {productsOptionsElement}
    </select>
  ]

  const handleOptionChange = (e) => {
    const value = e.target.value;
    setSelectedDate(value);

    // Show or hide the custom date range picker
    if (value === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
    }
  };

  const dateOptions = [
    { name: 'اليوم', value: 'today' },
    { name: 'البارحة', value: 'yesterday' },
    { name: 'هذا الاسبوع', value: 'this Week' },
    { name: 'هذا الشهر', value: 'this Month' },
    { name: 'تاريخ مخصص', value: 'custom' },
  ];  

   
  const dateOptionsElement = dateOptions.map(date => {
    return <option key={date.name} value={date.value}>{date.name}</option>
  })
  
  const dateSelectElement = [
    <div className="w-1/4 relative">
      <select 
        onChange={handleOptionChange} 
        value={selectedDate}
        className="w-full h-full py-2 px-4 bg-transparent border border-gray-200 rounded-md"
    >
        <option hidden>اختر التاريخ</option>
        {dateOptions.map(date => (
          <option key={date.value} value={date.value}>
            {date.name}
          </option>
        ))}
      </select>

      {showCustomDate && (
        <div className="absolute top-12 p-4 right-0 bg-[#f5f5f5] shadow-xl z-10">
          <label className="flex bg-transparent">
            <input 
              type="date" 
              className="bg-transparent"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
            :من
          </label>
          <label className="flex bg-transparent">
            <input 
              type="date" 
              className="bg-transparent"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
            :الى
          </label>
        </div>
      )}
    </div>
  ]


  const bodyElement =[
    <div className="flex gap-4 w-full">
        {dateSelectElement}
        {productsSelectElement}
        <input 
            type="number" 
            placeholder="cost"
            value={cost}
            className="no-focus-outline w-1/4 py-2 px-4 bg-transparent border border-gray-200 rounded-md"
            onChange={e => setCost(e.target.value)}
        />
        <button 
          className="bg-green-500 text-white font-semibold px-4 rounded-md"
          onClick={calculateProfit}
          disabled={selectedDate === 'custom' && !startDate && !endDate||!selectedDate || !selectedProduct  || !cost}
        >
        حساب

        </button>
    </div>
   
  ]

  const subtitlelmnt = [
    <span 
      className="text-green-500 whitespace-nowrap text-lg font-semibold"
    >
      الربح : {profit} دج
    </span>
  ]

  
 
    

  return (
    <DashboardCard
      title="Profit calculator" 
      subtitle={subtitlelmnt}
      body={bodyElement}
    />
  )
}

export default Profit