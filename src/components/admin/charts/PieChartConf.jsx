'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

async function fetchTrackingOrders() {
  const res = await axios.get('/api/orders/tracking');
  return res.data;
}

  async function fetchProducts() {
  const res = await axios.get('/api/products');
  return res.data;
}
const fetchOrders = async (filters) => {

  const res = await axios.get(`/api/orders/createdAt?date=${filters.date}&startDate=${filters.startDate}&endDate=${filters.endDate}`);
  return res.data;
};



function PieChartC() {

  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const { data: Products, isLoading:ProductsIsLoading, isError:ProductsIsError,error:ProductsError } = useQuery({
    queryKey:['Products admin dashboard'],
    queryFn: fetchProducts
  });

  const filter = {
    date: selectedDate,
    startDate: startDate || '',
    endDate: endDate || '',
  }

  const { data: Orders, isLoading, isError, error } = useQuery({
    queryKey: ['orders pie',filter],
    queryFn: ({queryKey})=>fetchOrders(queryKey[1]),
  });

  if (isLoading || ProductsIsLoading) return <div>Loading Chart ...</div>;
  if (isError || ProductsIsError) return <div>Error fetching Orders: {error?.message || ProductsError?.message}</div>;


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

  const confirmed = Orders.filter(order =>{
    let result = false
  
    if(selectedProduct &&order.orders.some(obj =>{
      
      return obj.title !== selectedProduct
    })) return false
    

    if(order.state === 'مؤكدة' ){
    
      result = true
    }
    return result
  });

  const inConfirmed = Orders.filter(order =>{
    let result = false

    if(selectedProduct &&order.orders.some(obj => obj.title !== selectedProduct)) return false

    if(order.state === 'غير مؤكدة'){
      result = true
    }
    return result
  });
  const between = Orders.filter(order =>{
    let result = false

    if(selectedProduct &&order.orders.some(obj => obj.title !== selectedProduct)) return false

    if(order.state !== 'غير مؤكدة' && order.state !== 'مؤكدة'){
      result = true
    }
    return result
  });


  const confirmedPercent = Math.floor((confirmed.length / (confirmed.length + inConfirmed.length + between.length)) * 100);
  const inConfirmedPercent = Math.floor((inConfirmed.length / (confirmed.length + inConfirmed.length + between.length)) * 100);
  const betweenPercent = Math.floor((between.length / (confirmed.length + inConfirmed.length + between.length)) * 100);

  const data = [
    { name: `مؤكدة ${confirmed.length}`, value: confirmedPercent, color: '#66FF66' },
    { name: `غير مؤكدة ${inConfirmed.length}`, value: inConfirmedPercent, color: '#FF6666' },
    { name: `غيرها ${between.length}`, value: betweenPercent, color: '#808080' },
  ];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${data[index].value}%`}
      </text>
    );
  };

  const productsOptionsElement = Products.map(product => {
    return <option key={product._id} value={product.title}>{product.title}</option>
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
    <div className="min-w-20 w-1/4 relative" key={'dateSelectElement'}>
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

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='flex items-center justify-evenly w-full'>
        {productsSelectElement}
        {dateSelectElement}
      </div>
      <PieChart width={500} height={300}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={renderCustomLabel}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
        />
      </PieChart>
    </div>
  )
}

export default PieChartC;