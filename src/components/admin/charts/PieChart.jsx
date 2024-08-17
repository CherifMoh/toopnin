'use client'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

async function fetchTrackingOrders() {
  const res = await axios.get('/api/orders/tracking');
  return res.data;
}


function PieChartC() {

  const { data: Orders, isLoading, isError, error } = useQuery({
    queryKey: ['orders Tracking'],
    queryFn: fetchTrackingOrders
  });

  if (isLoading) return <div>Loading Chart ...</div>;
  if (isError) return <div>Error fetching Orders: {error.message}</div>;


  const livred = Orders.filter(order => order.tracking === 'livred');
  const Retour = Orders.filter(order => order.tracking === 'returned');

  const livredPercent = Math.floor((livred.length / (livred.length + Retour.length)) * 100);
  const retourPercent = Math.floor((Retour.length / (livred.length + Retour.length)) * 100);

  const data = [
    { name: 'livred %', value: livredPercent, color: '#66FF66' },
    { name: 'Retour %', value: retourPercent, color: '#FF6666' },
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

  return (
    <div className='flex justify-center items-center'>
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