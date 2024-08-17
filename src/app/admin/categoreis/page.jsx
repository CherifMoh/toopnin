"use client"
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
import Link from "next/link";



async function fetchCategorys() {
    const res = await axios.get('/api/category');
    return res.data;
}


function Categorys() {
  typeof document !== 'undefined' && document.body.classList.add('bg-white')

  const { data: categoreis, isLoading, isError } = useQuery({
          queryKey:['Categorys'],
          queryFn: fetchCategorys
    });
  
  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Error fetching products</div>;

  const categoreisElemnt = categoreis.map(category=>(
    <div key={category.name}>      
      <h1>
        {category.name}
      </h1>
      <p>
        {category.price}
      </p>
    </div>
  ))

  return (
    <div>
      <Link href='/admin/categoreis/add'>Add</Link>
      {categoreisElemnt}
    </div>
  )
}

export default Categorys