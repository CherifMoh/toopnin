'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';


async function fetchLastWeekOrders() {
  const res = await axios.get('/api/orders/lastWeek');
  return res.data;
}

const OrdersLineChart = () => {

  const { data: Orders, isLoading, isError, error } = useQuery({
    queryKey: ['orders lastWeek'],
    queryFn: fetchLastWeekOrders
  });

  if (isLoading) return <div>Loading Chart ...</div>;
  if (isError) return <div>Error fetching Orders: {error.message}</div>;

  const ordersByDate = Orders.reduce((acc, order) => {
    // Extract the date part from the createdAt timestamp
    const date = new Date(order.createdAt).toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' });


    // Check if the date exists in the accumulator
    if (acc[date]) {
      acc[date].push(order);
    } else {
      acc[date] = [order];
    }

    return acc;
  }, {});

  // Transform the grouped data into the format required for the chart
  let chartData = Object.entries(ordersByDate).map(([date, orders]) => ({
    day: date,
    Orders: orders.length // Count the number of orders for each date
  }));

  chartData = chartData.slice().reverse();

  // const data = [
  //   { day: 'june 1', Orders: 70 },
  //   { day: 'june 2', Orders: 75 },
  //   { day: 'june 3', Orders: 80 },
  //   { day: 'june 4', Orders: 78 },
  //   { day: 'june 5', Orders: 85 },
  //   { day: 'june 6', Orders: 88 },
  //   { day: 'june 7', Orders: 82 },
  // ];

  return (
    <LineChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="Orders" stroke="#8884d8" dot={false} activeDot={{ r: 8 }} />
    </LineChart>
  );
}

export default OrdersLineChart;
