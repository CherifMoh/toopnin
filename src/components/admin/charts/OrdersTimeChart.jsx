'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useState, useMemo } from 'react';

// Fetch Products and Orders from API
async function fetchProducts() {
  const res = await axios.get('/api/products');
  return res.data;
}

const fetchOrders = async (filters) => {
  const res = await axios.get(`/api/orders?date=${filters.date}&startDate=${filters.startDate}&endDate=${filters.endDate}`);
  return res.data;
};

// Helper function to generate date ranges
const generateDateRange = (start, end) => {
  return eachDayOfInterval({ start: new Date(start), end: new Date(end) });
};

const OrdersLineChart = () => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedDate, setSelectedDate] = useState('this Week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);

  const { data: Products, isLoading: ProductsIsLoading, isError: ProductsIsError, error: ProductsError } = useQuery({
    queryKey: ['Products admin dashboard'],
    queryFn: fetchProducts
  });

  const filter = {
    date: selectedDate,
    startDate: startDate || '',
    endDate: endDate || '',
  };

  const { data: Orders, isLoading: isLoadingOrders, isError: isOrdersError, error: ordersError } = useQuery({
    queryKey: ['orders', filter],
    queryFn: ({ queryKey }) => fetchOrders(queryKey[1]),
  });

  if (isLoadingOrders || ProductsIsLoading) return <div>Loading Chart ...</div>;
  if (isOrdersError || ProductsIsError) return <div>Error fetching Orders: {ordersError?.message || ProductsError?.message}</div>;

  // Generate chart data
  let dateRange = [];
  let chartData = [];
  let hourlyOrderCounts = {}; // To store order counts by hour

  switch (selectedDate) {
    case 'today':
      dateRange = generateDateRange(new Date(), new Date());
      break;
    case 'yesterday':
      dateRange = generateDateRange(new Date(new Date().setDate(new Date().getDate() - 1)), new Date(new Date().setDate(new Date().getDate() - 1)));
      break;
    case 'this Week':
      dateRange = generateDateRange(startOfWeek(new Date()), endOfWeek(new Date()));
      break;
    case 'this Month':
      dateRange = generateDateRange(startOfMonth(new Date()), endOfMonth(new Date()));
      break;
    case 'custom':
      dateRange = generateDateRange(startDate, endDate);
      break;
    default:
      dateRange = [];
  }

  dateRange.forEach(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    Orders?.forEach(order => {
      const orderDate = parseISO(order.createdAt);
      const isOrderOnDate = format(orderDate, 'yyyy-MM-dd') === formattedDate;
      if (!isOrderOnDate) return;
      
      order.orders.forEach(product => {
        if (isOrderOnDate && (!selectedProduct || product.productID === selectedProduct)) {
          const hour = format(orderDate, 'HH');
          if (!hourlyOrderCounts[hour]) hourlyOrderCounts[hour] = 0;
          hourlyOrderCounts[hour] += product.qnt;
        }
      });
    });
  });

  // Find the hour with the most orders
  const bestHour = Object.keys(hourlyOrderCounts).reduce((a, b) => hourlyOrderCounts[a] > hourlyOrderCounts[b] ? a : b, '00');

  chartData = dateRange.map(date => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    let orderCount = 0;
    Orders?.forEach(order => {
      const isOrderOnDate = format(parseISO(order.createdAt), 'yyyy-MM-dd') === formattedDate;
      if (!isOrderOnDate) return;
      order.orders.forEach(product => {
        if (isOrderOnDate && (!selectedProduct || product.productID === selectedProduct)) {
          orderCount += product.qnt;
        }
      });
    });
    return { day: formattedDate, orders: orderCount };
  });

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
    { name: 'هذا الاسبوع', value: 'this Week' },
    { name: 'هذا الشهر', value: 'this Month' },
    { name: 'تاريخ مخصص', value: 'custom' },
  ];

  const dateOptionsElement = dateOptions.map((date) => {
    return <option key={date.name} value={date.value}>{date.name}</option>;
  });

  const dateSelectElement = (
    <div className="min-w-20 w-1/4 relative" key={'dateSelectElement'}>
      <select
        onChange={handleOptionChange}
        value={selectedDate}
        className="w-full h-full py-2 px-4 bg-transparent border border-gray-200 rounded-md"
      >
        <option hidden>اختر التاريخ</option>
        {dateOptionsElement}
      </select>

      {showCustomDate && (
        <div className="absolute -top-[85px] p-4 right-0 bg-[#f5f5f5] shadow-xl z-10">
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
  );

  const productsOptionsElement = Products.map((product) => {
    return <option key={product._id} value={product._id}>{product.title}</option>;
  });

  const productsSelectElement = (
    <select
      key={'productsSelectElement'}
      name="product"
      value={selectedProduct}
      className="min-w-20 w-1/4 py-2 px-4 bg-transparent border border-gray-200 rounded-md"
      onChange={(e) => setSelectedProduct(e.target.value)}
    >
      <option hidden>اختر المنتج</option>
      {productsOptionsElement}
    </select>
  );


  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { day, orders } = payload[0].payload;

      // Find the best hour for the selected day
      const dailyHourlyCounts = Orders.reduce((acc, order) => {
        const orderDate = format(parseISO(order.createdAt), 'yyyy-MM-dd');
        if (orderDate === day) {
          order.orders.forEach((product) => {
            if (!selectedProduct || product.productID === selectedProduct) {
              const hour = format(parseISO(order.createdAt), 'HH');
              acc[hour] = (acc[hour] || 0) + product.qnt;
            }
          });
        }
        return acc;
      }, {});

      const bestHourForDay = Object.keys(dailyHourlyCounts).reduce((a, b) =>
        dailyHourlyCounts[a] > dailyHourlyCounts[b] ? a : b, '00'
      );

      return (
        <div className="bg-white p-2 border border-gray-300 shadow-lg">
          <p className="label">{`اليوم: ${day}`}</p>
          <p className="intro">{`الطلبات: ${orders}`}</p>
          {orders > 0 && (
            <p className="desc">{`أفضل وقت: ${bestHourForDay}:00`}</p>
          )}
        </div>
      );
    }

    return null;
  };


  return (
    <div className="flex-col">
      <div className="flex items-center justify-evenly mb-2">
       <h2>أفضل وقت: {bestHour}:00</h2>
        {dateSelectElement}
        {productsSelectElement}
      </div>
      <div className="w-full h-[292px]">
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
            <XAxis dataKey="day" tickFormatter={(tick) => format(parseISO(tick), 'dd MMM')} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#8884d8"
              dot={false}
              activeDot={{ r: 8 }}
              name="Orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
    </div>
  );
};

export default OrdersLineChart;
