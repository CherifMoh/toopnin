'use client'

import { faPlus, faSearch, faMinus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import {editAddRewMateQnt, editMinusRewMateQnt} from "../../../app/actions/storage";


const fetchRewMates = async () => {
    const res = await axios.get(`/api/storage/rewMates`);
    if(!res.data) return []
    return res.data;
}


function RewMatesComp({isUpdateAccess}) {


    const queryClient = useQueryClient();

    const { data: RewMates, isLoading: IsLoading, isError: IsError, error: Error } = useQuery({
        queryKey: ['Rew Mates'],
        queryFn: fetchRewMates
    });

    const [isRewMates, setIsRewMates] = useState(false);
    const [newRewMates, setNewRewMates] = useState([]);
    
    const [newQnts, setNewQnts] = useState([]);
    
    const [noQnt, setNoQnt] = useState(false);
    const [noPrice, setNoPrice] = useState(false);

    const [minusQnt, setMinusQnt] = useState();


    const [isPlus, setIsPlus] = useState([]);
    const [isMinus, setIsMinus] = useState([]);

    const [qnt, setQnt] = useState();
    const [price, setPrice] = useState();

    const [search, setSearch] = useState();

    const [note,setNote] = useState('');
    
    useEffect(()=>{
        setNewRewMates(RewMates)
    },[RewMates])

    useEffect(()=>{
        setNewQnts({qnt:qnt,price:price})
    },[qnt,price])

    if (IsLoading) return <div>Loading...</div>;

    if (IsError) return <div>Error: {Error.message}</div>;

    function handleRewMatesChange(newQnt,oldRewMate) {
        const newRewMate = {...oldRewMate,qnt:newQnt}
        setNewRewMates(pre=>pre.map(rewMate=>{
            if(rewMate._id === newRewMate._id) return newRewMate
            return rewMate
        }))
    }

    function submitAddRewMatesQnts(id,name) {

        if(price) setNoPrice(false)
        if(qnt) setNoQnt(false)
        if(!price) return setNoPrice(true)
        if(!qnt) return setNoQnt(true)
        editAddRewMateQnt(id,newQnts,name)
        setIsPlus(pre=>pre.filter(id=>id !== id))
        queryClient.invalidateQueries(['Rew Mates'])
        setQnt()
        setPrice()
    }
    
    function submitMinusRewMatesQnts(id,name) {    
      
        if(minusQnt) setNoQnt(false)
        if(!minusQnt) return setNoQnt(true)
            
        editMinusRewMateQnt(id,minusQnt,name,note)
        queryClient.invalidateQueries(['Rew Mates'])
        setIsMinus(pre=>pre.filter(id=>id !== id))
        setMinusQnt()
    }
            
            const RewMatesElement = RewMates.map(rewMate=>{
                if(search && !rewMate.name.toLowerCase().includes(search.toLowerCase())) return
                let totalQnt = 0
                
        rewMate.qnts.forEach(qnt=>totalQnt=totalQnt+Number(qnt.qnt))
        totalQnt = totalQnt.toFixed(2)

        return (
            <div 
                className={`px-2  w-full py-1 border-gray-700 border-b last:border-b-0 flex items-center ${isUpdateAccess?'justify-between':'justify-center'}`}
                key={rewMate._id}
            >
                    {isUpdateAccess &&
                    <button 
                        onClick={()=>setIsPlus(pre=>[...pre,rewMate._id])}
                        className="h-5"
                    >
                        <FontAwesomeIcon icon={faPlus} className='text-green-500' />
                    </button>}
                    <div className="flex gap-1 items-center">
                        <span>{rewMate.name}</span>
                        <span className="bg-[#DCCCB3] text-sm rounded-md px-1">{totalQnt}</span>
                    </div>

                    {isUpdateAccess &&
                    <button 
                        onClick={()=>setIsMinus(pre=>[...pre,rewMate._id])}
                        className="h-5"
                    >
                        <FontAwesomeIcon icon={faMinus} className='text-red-500' />
                    </button>}

                        {isPlus.includes(rewMate._id) && 
                            <div className="bg-[#0000004f] md:p-48 p-72 z-[999] backdrop-filter backdrop-blur-sm h-screen w-screen fixed top-0 right-0">
                               <div className=" m-auto bg-[#f5f5f5] rounded-xl w-max p-4">
                                <h1 className="text-center text-2xl font-semibold mb-2">
                                    {rewMate.name}
                                </h1>
                                <table className='m-auto'>
                                    <thead>
                                        <th>كمية</th>
                                        <th>سعر</th>
                                        <th>total</th>
                                    </thead>
                                    <tbody>
                                        <td>
                                            {noQnt &&
                                            <div>
                                                <p className="text-red-600">كمية مطلوبة</p>
                                            </div>
                                            }
                                            <input 
                                                type="number" 
                                                className="no-focus-outline bg-transparent w-full h-full"
                                                placeholder="كمية"
                                                onChange={(e)=>{
                                                    handleRewMatesChange(Number(e.target.value)+Number(rewMate.qnt),rewMate)
                                                    setQnt(e.target.value)
                                                }}
                                            />
                                        </td>
                                        <td>
                                            {noPrice &&
                                            <div>
                                                <p className="text-red-600">السعر مطلوب</p>
                                            </div>
                                            }
                                            <input 
                                                type="number" 
                                                className="no-focus-outline bg-transparent w-full h-full"
                                                placeholder="سعر"
                                                onChange={(e)=>setPrice(e.target.value)}
                                            />

                                        </td>
                                        <td>{qnt&&price&&qnt*price}</td>
                                    </tbody>
                                </table>
                                <div className="flex items-center justify-center mt-4">
                                    <button 
                                        className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                                        onClick={()=>submitAddRewMatesQnts(rewMate._id,rewMate.name)}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        className='bg-red-700 py-1 px-2 ml-2 rounded-full'
                                        onClick={()=>{
                                            setIsPlus(pre=>pre.filter(id=>id !== rewMate._id))
                                            setQnt()
                                            setPrice()
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faX} className="text-white" />
                                    </button>
                                </div>
                                </div>
                            </div>
                        }
                        {isMinus.includes(rewMate._id) && 
                            <div className="bg-[#0000004f] md:p-48 p-72 z-[999] backdrop-filter backdrop-blur-sm h-screen w-screen fixed top-0 right-0">
                               <div className=" m-auto bg-[#f5f5f5] rounded-xl w-max p-4">
                                <h1 className="text-center text-2xl font-semibold mb-2">
                                    {rewMate.name}
                                </h1>
                                <table className='m-auto'>
                                    <thead>
                                        <th>كمية</th>
                                        <th>ملاحظة</th>
                                    </thead>
                                    <tbody>
                                        <td>
                                            <input 
                                                type="number" 
                                                className="no-focus-outline bg-transparent w-full h-full"
                                                placeholder="كمية"
                                                onChange={(e)=>setMinusQnt(e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="no-focus-outline bg-transparent w-full h-full"
                                                placeholder="ملاحظة"
                                                onChange={(e)=>setNote(e.target.value)}
                                            />

                                        </td>
                                    </tbody>
                                </table>
                                <div className="flex items-center justify-center mt-4">
                                <button 
                                        className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                                        onClick={()=>submitMinusRewMatesQnts(rewMate._id,rewMate.name)}
                                    >
                                        Save
                                    </button>
                                    <button 
                                        className='bg-red-700 py-1 px-2 ml-2 rounded-full'
                                        onClick={()=>{
                                            setIsMinus(pre=>pre.filter(id=>id !== rewMate._id))
                                            setQnt()
                                            setPrice()
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faX} className="text-white" />
                                    </button>
                                </div>
                                </div>
                            </div>
                        }
                    
            </div>
        )
    })



  return (
    <div className="flex flex-col">
        <button
            className="px-8 py-3 rounded-md border border-black"
            onClick={()=>setIsRewMates(pre=>!pre)}
        >
            مادة أولية  
        </button>

        {isRewMates &&
        <div className="flex relative flex-col border border-gray-700 divide-y rounded-md justify-center items-end mt-4 gap-1">
            <div>
            <FontAwesomeIcon icon={faSearch} className="absolute text-gray-600 size-4 top-2 cursor-pointer right-1" />
            <input   
                type="text" 
                className="no-focus-outline bg-transparent px-3 pt-1  w-full h-full" 
                placeholder="Search"
                onChange={(e)=>setSearch(e.target.value)}
                />
            </div>
            {RewMatesElement}
        </div>
        }
    </div>
  )
}

export default RewMatesComp