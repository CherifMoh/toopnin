"use client"

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

async function fetchOrders(date) {

    const res = await axios.get('/api/orders', {
        params: { date: date }
    });
    return res.data;
}
function Fix() {

    const [count, setCount] = useState(0);

    const dateFilter = 'Maximum'

    const { data: Orders, isLoading, isError, error } = useQuery({
        queryKey: ['orders',dateFilter],
        queryFn: ({queryKey})=>fetchOrders(queryKey[1]),
        // enabled: !!dateFilter,
    });

    if (isLoading ) return <div>Loading...</div>;
    if (isError ) {
        return <div>Error fetching Data: {
            error?.message 
           
        }</div>;
    }
    const notakingOrders = Orders?.filter((order) => !order.tracking);
    const phoneNumbers =notakingOrders.map(order => order.phoneNumber);
    console.log(notakingOrders)
    
   
  return (
    <main className="w-full h-screen pt-20 flex flex-col items-center justify-center bg-gray-100">
        <div className="flex items-center gap-4">
            <div
            className="text-2xl font-bold text-gray-600 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-150 cursor-pointer px-4 py-2 rounded-full bg-gray-200"
            onClick={() => setCount(count - 1)}
            >
            -
            </div>
            <div className="text-xl font-semibold text-gray-800 bg-white px-6 py-2 rounded shadow">
            {phoneNumbers[count]}
            </div>
            <div
            className="text-2xl font-bold text-gray-600 hover:bg-gray-300 active:bg-gray-400 transition-colors duration-150 cursor-pointer px-4 py-2 rounded-full bg-gray-200"
            onClick={() => setCount(count + 1)}
            >
            +
            </div>
        </div>
    </main>

  )
}

export default Fix