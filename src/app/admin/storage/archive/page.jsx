'use client'

import { useQuery } from "@tanstack/react-query";
import axios from "axios";


import RedBG from '../../../../../public/assets/red bg.png'
import GreenBG from '../../../../../public/assets/green bg.png'
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


const fetchArchive = async () => {
  const res = await axios.get(`/api/storage/archive`);
  if(!res.data) return []
  return res.data;
}

function Archive() {

  const { data: Archive, isLoading: IsLoading, isError: IsError, error: Error } = useQuery({
    queryKey: ['Archive'],
    queryFn: fetchArchive
  });

  const [search, setSearch] = useState('');
  
  const [dateFilter, setDateFilter] = useState('الكل');

  const [typeFilter, setTypeFilter] = useState(['الكل']);
  
  const [actionFilter, setActionFilter] = useState(['الكل']);


  if(IsLoading) return <div>Loading...</div>
  if(IsError)return <div>{Error.message}</div>

  function formateDate(dateString) {
    // Create a Date object
    const date = new Date(dateString);

    // Get the year, month, and day
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');

    // Format the date as yyyy-mm-dd
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
}

  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);

    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const isYesterday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
  
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
  
    return (
      yesterday.getFullYear() === date.getFullYear() &&
      yesterday.getMonth() === date.getMonth() &&
      yesterday.getDate() === date.getDate()
    );
  };

  const isInPastWeek = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
  
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
  
    return date > oneWeekAgo && date < today;
  };
  
  const isInLastMonth = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
  
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
  
    return date > oneMonthAgo && date < today;
  };
  

  function filter(item){
    let result = []

    const searchResult = search === '' ? true : item.name.toLowerCase().includes(search.toLowerCase())
    if(!searchResult) result = result.push(false)

    const itemDate =formateDate(item.createdAt)

    if(dateFilter === 'اليوم' && !isToday(itemDate)) result.push(false)
    if(dateFilter === 'البارحة' && !isYesterday(itemDate)) result.push(false)
    if(dateFilter === 'هذا الاسبوع' && !isInPastWeek(itemDate)) result.push(false)
    if(dateFilter === 'هذا الشهر' && !isInLastMonth(itemDate)) result.push(false)


    let typeResult 
    if(typeFilter.length === 0) typeResult = (false)

    typeResult =false
    if(
      typeFilter.includes('مواد اولية') && item.type === 'مواد اولية'
      ||typeFilter.includes('قطعة') && item.type === 'قطعة'
      ||typeFilter.includes('منتح نهائي') && item.type === 'منتح نهائي'
    ) typeResult = true
    if(typeFilter.includes('الكل')) typeResult = true

    if(!typeResult) result.push(false)

    let actionResult 
    if(actionFilter.length === 0) actionResult = false

    actionResult = false
    if(
      actionFilter.includes('ادخال') && item.action === 'ادخال'
      ||actionFilter.includes('اخراج') && item.action === 'اخراج'
    ) actionResult = true
    if(actionFilter.includes('الكل')) actionResult = true

    if(!actionResult) result.push(false)
    
      result =!result.includes(false)

    return result

  }

  const ArchiveElements = Archive.map((item) => {
    if(!filter(item))return
    return(
      <tr key={item._id} className="text-center">
        <td>{item.name}</td>
        <td>{item.type}</td>
        <td>{item.note}</td>
        <td className="relative">

          <div className="z-20 relative text-white">{item.action}</div>
          <Image 
            src={item.action === 'ادخال' ? GreenBG.src : RedBG.src} 
            alt=""
            width={50} height={20}
            className="absolute top-[15px] right-1/2 translate-x-1/2 z-10"
          />

        </td>
        <td>{item.price}</td>
        <td>{item.qnt}</td>
        <td>{item.qnt*item.price}</td>
        <td>{formateDate(item.createdAt)}</td>

      </tr>
    )
  })

  const theadArray = [
    'اسم',
    'نوع',
    'ملاحظة',
    'العملية',
    'سعر الوحدة',
    'الكمية',
    'السعر الكلي',
    'التاريخ',
    // 'user'
  ]
  const theadElements = theadArray.map((item,index) => <th key={index}>{item}</th>)

  const types=[
    'مواد اولية',
    'قطعة',
    'منتح نهائي'
  ]
  
  const typesElement=types.map((item) =>{
    return(
      <div 
        key={item}
        className="flex items-center justify-end gap-2 p-2 pl-4"
      >
        <span>
          {item}
        </span>
        <input 
          type="checkbox" 
          className="rounded-full"
          value={item}
          checked={typeFilter.includes(item)}
          onChange={(e) => setTypeFilter(pre=>{
            if(pre.includes(item)){
              return pre.filter(ite => ite !== item)
            }else{
              return [...pre, item]
            }
          })}
        />
    </div>
    )
  })

  const actions=[
    'اخراج',
    'ادخال',
  ]
  
  const actionsElement=actions.map((item) =>{
    return(
      <div 
        key={item}
        className="flex items-center justify-end gap-2 p-2 pl-4"
      >
        <span>
          {item}
        </span>
        <input 
          type="checkbox" 
          className="rounded-full"
          value={item}
          checked={actionFilter.includes(item)}
          onChange={(e) => setActionFilter(pre=>{
            if(pre.includes(item)){
              return pre.filter(ite => ite !== item)
            }else{
              return [...pre, item]
            }
          })}
        />
    </div>
    )
  })
  
  const dates=[
    'اليوم',
    'البارحة',
    'هذا الاسبوع',
    'هذا الشهر',
  ]
  
  const datesElement=dates.map((item) =>{
    return(
      <div 
        key={item}
        className="flex items-center justify-end gap-2 p-2 pl-4"
      >
        <span>
          {item}
        </span>
        <input 
          type='radio' 
          className="rounded-full"
          value={item}
          checked={dateFilter === item}
          onChange={e => setDateFilter(e.target.value)}
          name="date"
        />
      </div>
    )
  })

  return (
    <main
      className="w-full h-full gap-8 flex flex-col justify-center items-start"
    >
        <h1 className="text-4xl w-full text-center text-[#1a2332] font-bold my-4">
          Archive         
        </h1>
      <div className="w-full h-full gap-8 flex justify-center items-start">

        <div>
          <div className='relative'>
              <FontAwesomeIcon
                  icon={faMagnifyingGlass}
                  className={`absolute left-56 size-4 top-0 pt-3 z-10 ${search ? 'hidden' : 'opacity-50'}`}
              />
              <input
                  onChange={e => setSearch(e.target.value)}
                  type="search"
                  placeholder="Search"
                  className='w-64 text-sm p-2 border-2 border-gray-500 rounded-xl no-focus-outline'
              />
          </div>

          <div className="mt-4 text-end">
            <h2 className="text-2xl font-bold text-[#1a2332]">
              التاريخ
            </h2>
            <div className="flex items-center justify-end gap-2 p-2 pl-4">
                <span>
                  كل الأوقات
                </span>
                <input 
                  type='radio' 
                  className="rounded-full"
                  value={'الكل'}
                  checked={dateFilter === 'الكل'}
                  onChange={e => setDateFilter(e.target.value)}
                  name="date"
                />
            </div>
            {datesElement}
          </div>

          <div className="mt-4 text-end">
            <h2 className="text-2xl font-bold text-[#1a2332]">
              النوع
            </h2>
            <div className="flex items-center justify-end gap-2 p-2 pl-4">
                <span>
                  الكل
                </span>
                <input 
                  type="checkbox" 
                  className="rounded-full"
                  value={'الكل'}
                  checked={typeFilter.includes('الكل')}
                  onChange={(e) => setTypeFilter(pre=>{
                    if(pre.includes('الكل')){
                      return pre.filter(item => item !== 'الكل')
                    }else{
                      return [...pre, 'الكل']
                    }
                  })}
                />
            </div>
            {typesElement}
          </div>

          <div className="mt-4 text-end">
            <h2 className="text-2xl font-bold text-[#1a2332]">
              العملية
            </h2>
            <div className="flex items-center justify-end gap-2 p-2 pl-4">
                <span>
                  الكل
                </span>
                <input 
                  type="checkbox" 
                  className="rounded-full"
                  value={'الكل'}
                  checked={actionFilter.includes('الكل')}
                  onChange={(e) => setActionFilter(pre=>{
                    if(pre.includes('الكل')){
                      return pre.filter(item => item !== 'الكل')
                    }else{
                      return [...pre, 'الكل']
                    }
                  })}
                />
            </div>
            {actionsElement}
          </div>

        </div>

        <table className="w-3/4">
          <thead>
            <tr>{theadElements}</tr>
          </thead>
          <tbody>
            {ArchiveElements}
          </tbody>
        </table>
      </div>
    </main>
  )
}

export default Archive