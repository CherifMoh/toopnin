'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowLeftLong, faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';


async function fetchTodayOrders() {
  const res = await axios.get('/api/orders/createdAt?date=today');
  return res.data;
}

async function fetchProducts() {
  const res = await axios.get('/api/products');
  return res.data;
}

async function fetchYesterdayOrders() {
  const res = await axios.get('/api/orders/createdAt?date=yesterday');
  return res.data;
}
const OrdersLineChart = () => {

  const { data: Products, isLoading:ProductsIsLoading, isError:ProductsIsError,error:ProductsError } = useQuery({
    queryKey:['Products admin dashboard'],
    queryFn: fetchProducts
  });
  const { data: todayOrders, isLoading:todayIsLoading, isError:todayIsError, error:todayError } = useQuery({
    queryKey: ['orders today'],
    queryFn: fetchTodayOrders
  });
  const { data: yesterdayOrders, isLoading, isError, error } = useQuery({
    queryKey: ['orders yesterday'],
    queryFn: fetchYesterdayOrders
  });

  
  const [selectedProduct, setSelectedProduct] = useState('')
  const [showTooltip, setShowTooltip] = useState(false);

  if (isLoading || todayIsLoading || ProductsIsLoading) return <div>Loading Chart ...</div>;
  if (isError || todayIsError || ProductsIsError) return <div>Error fetching Orders: {error?.message || todayError?.message || ProductsError?.message}</div>;
  

 

  // Function to aggregate orders by hour
  function aggregateOrdersByHour(orders) {
    const hourlyData = Array(24).fill(0); // Initialize an array with 24 zeros

    orders?.forEach(order => {
      const hour = parseISO(order.createdAt).getHours();
      order.orders?.forEach((product) => {
        if (selectedProduct && selectedProduct!==product.productID) return
        
        hourlyData[hour] += Number(product.qnt);
      })
    });

    return hourlyData.map((qnt, hour) => ({
      hour: `${hour}:00`,
      qnt,
    }));
  };

  const todayData = aggregateOrdersByHour(todayOrders);
  const yesterdayData = aggregateOrdersByHour(yesterdayOrders);

  // Combine today's and yesterday's data into a single array for the chart
  const chartData = todayData.map((data, index) => ({
    hour: data.hour,
    todayQnt: data.qnt,
    yesterdayQnt: yesterdayData[index].qnt,
  }));

  const todayTotalQnt = todayData.reduce((acc, data) => acc + data.qnt, 0);
  const yesterdayTotalQnt = yesterdayData.reduce((acc, data) => acc + data.qnt, 0);

  const todayMore = todayTotalQnt > yesterdayTotalQnt;
  const difference = Math.abs(todayTotalQnt - yesterdayTotalQnt);

  const qntElement = (
    <div key={'todayTotalQnt'} className="text-lg font-bold flex gap-2 items-center">
      {todayTotalQnt}
      <div 
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <FontAwesomeIcon
          icon={faArrowRightLong}
          className={todayMore ? 'text-green-500 -rotate-45' : 'text-red-500 rotate-45'}
        />
        {showTooltip && (
        <div className="absolute bottom-full whitespace-nowrap left-1/2 transform -translate-x-1/2 mb-2 bg-gray-700 text-white text-sm rounded px-2 py-1">
          {todayMore ? `أكثر : ${difference}` : `أقل : ${difference}`}
        </div>
      )}
      </div>
    </div>
  );

  const productsOptionsElement = Products.map(product => {
    return <option key={product._id} value={product._id}>{product.title}</option>
  })

  const productsSelectElement = [
    <select 
        key={'productsSelectElement'}
        name="product" 
        value={selectedProduct}
        className="min-w-20 w-1/4 py-2 px-4 bg-transparent border border-gray-200 rounded-md"
        onChange={e => setSelectedProduct(e.target.value)}
    >
        <option hidden>اختر المنتج</option>
        {productsOptionsElement}
    </select>
  ]

  return (
    <div className='flex-col'>
      <div className='flex justify-between mb-2'>
        {qntElement}
        {productsSelectElement}
      </div>
      <div className='w-full h-[292px]'>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="todayQnt"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
              name="Today's Orders"
              />
            <Line
              type="monotone"
              dataKey="yesterdayQnt"
              stroke="#82ca9d"
              strokeDasharray="5 5"
              dot={false}
              name="Yesterday's Orders"
              />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default OrdersLineChart;
