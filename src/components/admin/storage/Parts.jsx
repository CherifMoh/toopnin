'use client'

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import arrowDown from '../../../../public/assets/arrow-down.svg'
import Image from "next/image";
import { faX, faPlus, faMinus, faHammer, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { editAddPart, editMinusRewMateQnt, editAddRewMateQnt, editMinusPart, editReadyPart } from '../../../app/actions/storage'
import { unstable_noStore as noStore } from "next/cache";


export const dynamic = "force-dynamic"

const fetchProductsParts = async () => {
    noStore()
    const res = await axios.get(`/api/products/parts`);
    if(!res.data) return []
    return res.data;
}

const fetchRewMates = async () => {
    noStore()
    const res = await axios.get(`/api/storage/rewMates`);
    if(!res.data) return []
    return res.data;
}

const fetchPartByName = async (name) => {
    noStore()
    const response = await fetch(`/api/storage/workshop/${name}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('An error occurred while fetching the data.');
    }
    return response.json();
}

const fetchParts = async () => {
    noStore()
    const res = await axios.get(`/api/storage/workshop`);
    if(!res.data) return []
    return res.data;
}


function Parts({isUpdateAccess}) {
    noStore()
    const [EditedPart, setEditedPart] = useState({name:'',mates:[]});
    
    const { data: Products, isLoading: IsLoading, isError: IsError, error: Error } = useQuery({
        queryKey: ['parts'],
        queryFn: fetchProductsParts
    });

    const { data: Part, isLoading: IsPartLoading, isError: IsPartError, error: PartError } = useQuery({
        queryKey: ['part by name', EditedPart.name],
        queryFn: ({ queryKey }) => fetchPartByName(queryKey[1]),
        enabled: !!EditedPart.name,
    });

    const { data: allParts, isLoading: IsPartsLoading, isError: IsPartsError, error: PartsError } = useQuery({
        queryKey: ['All parts'],
        queryFn: fetchParts,
    });

    const { data: RewMates, isLoading: IsRewLoading, isError: IsRewError, error: RewError } = useQuery({
        queryKey: ['Rew Mates'],
        queryFn: () => fetchRewMates(EditedPart.name||'randome name')
    });

    const [isProducts, setIsProducts] = useState(false);
    const [isParts, setIsParts] = useState([]);
    const [isDetails, setIsDetails] = useState(false);

    

    const [qnt, setQnt] = useState(1);

    const [minusQnt, setMinusQnt] = useState(1);
    
    const [totalPrice, setTotalPrice] = useState(0);

    const [plusOrMinus,setPlusOrMinus] = useState('plus');

    const [neededMates,setNeededMates] = useState([]);

    const [isMax,setIsMax] = useState([]);

    const [minusMax,setMinusMax] = useState(0);

    const [isRedBG,setIsRedBG] = useState(false);

    const [note,setNote] = useState('');

    const [notReadyQnt,setNotReadyQnt] = useState(0);
    
    const [Ready,setReady] = useState(false);

    const [emptyMate,setEmptyMate] = useState(false);

    const queryClient = useQueryClient()


    useEffect(()=>{
        if (!Products || !EditedPart) return;


        setEditedPart(pre => {
            let updatedPart = { ...pre };
        
            updatedPart.mates = updatedPart.mates.map(mate => {
              let oldQnt = 0;
        
              Products.forEach(product => {
                product.parts.forEach(part => {
                  if (part.name !== pre.name || !part.mates) return;
        
                  part.mates.forEach(oldMate => {
                    if (oldMate.name === mate.name) {
                        
                      oldQnt = oldMate.qnt;
                    }
                  });
                });
              });
        
              const newQnt =plusOrMinus === 'plus' ? Number(oldQnt) * Number(qnt) : Number(oldQnt) * Number(minusQnt);
              return { ...mate, qnt: newQnt };
            });
        
            return updatedPart;
          });
        

      
    },[qnt,minusQnt,Products])

    useEffect(()=>{
        if(!RewMates || !EditedPart || !EditedPart?.mates) return
        if(plusOrMinus === 'minus') return
        let totalAmount = 0
        RewMates.forEach(rewMate=>{
    
            const needed =EditedPart?.mates?.filter(item => item.name === rewMate.name);
            if(rewMate.qnts.length === 0){
                setNeededMates(pre=>{
                    const i =pre.findIndex(item => item?.name === rewMate.name)
                    const editepartRewMate = EditedPart.mates.find(item => item?.name === rewMate.name)
                    if(!editepartRewMate) return pre
                    if(i !== -1){
                        pre[i] = editepartRewMate
                        return pre
                    }
                    setIsMax(pre=>[...pre, editepartRewMate.name])
                    return [...pre, editepartRewMate]

                })
                return
            }
            if( !needed[0]) return
            const total = calculateTotal(rewMate.qnts, needed[0]?.qnt, needed[0]?.name)

            if(typeof total === 'number'){
                if(isMax.includes(needed[0]?.name)){
                    setIsMax(pre=>pre.filter(item => item !== needed[0]?.name))
                    setNeededMates(pre=>{
                        return pre.map(item=>{
                            if(item?.name !== needed[0].name){
                                return item
                            }
                        })
                    })
                }
                totalAmount += total
            }else{
                totalAmount += total[0]
                updateNeededMates(total[1])
                setIsMax(pre=>{
                    if(pre.includes(total[1].name)) return pre
                    return [...pre, total[1].name]
                })
            }
            
        })
        setTotalPrice(totalAmount)
    },[EditedPart,RewMates])  
    
    useEffect(()=>{
        if(!RewMates || !EditedPart || !plusOrMinus || !EditedPart?.mates ) return

        
        EditedPart.mates.forEach(rewMate=>{
            let includes = false
            RewMates.forEach(item=>{
                if(item.name === rewMate.name){
                    includes = true
                }
            })
            if(!includes){
                updateNeededMates(rewMate)            
                setEmptyMate(true)
                if(!isMax.includes(rewMate.name)){
                    setIsMax(pre=>[...pre, rewMate.name])
                }
                setEditedPart(pre=>{
                    const newMates =pre.mates.map(mat=>{
                        if(mat.name === rewMate.name){
                            return {...mat, qnt: 'لا يوجد'}
                        }
                        return mat
                    })
                    return {...pre, mates:newMates}
                })
                
            }
        })

    },[EditedPart,RewMates,plusOrMinus])

    // useEffect(()=>{
    //     setIsRedBG(pre=>!pre)
    //     const interval = setInterval(()=>{setIsRedBG(pre=>!pre)},250)
    //     setTimeout(()=>{clearInterval(interval)},1000)
    // },[isMax])

    useEffect(()=>{
        if(!Part) return
        let maxQnt = 0
        if(Part.qnts)Part.qnts.forEach(qnt=>{
            maxQnt+=Number(qnt.qnt)
        })
        setMinusMax(maxQnt)
        if(maxQnt === 0) setMinusQnt(0)

    },[Part])



    if(IsLoading ||IsRewLoading || IsPartLoading || IsPartsLoading) return <div>Loading...</div>;
    
    if(IsError) return <div>Error: {Error.message}</div>;

    if(IsRewError) return <div>Error: {RewError.message}</div>;

    if(IsPartError) return <div>Error: {PartError.message}</div>;

    if(IsPartsError) return <div>Error: {PartsError.message}</div>;

    const notReadyParts = allParts
    .map(part => {
        const newQnts = part.qnts.filter(qnt => !qnt.ready);
        return {...part, qnts: newQnts};
    })
    .filter(part => part.qnts.length > 0);

    let notReadyMax = 0

    notReadyParts.forEach(part=>{
        if(part.name !== EditedPart.name) return
        
        part.qnts.forEach(qnt=>{
            notReadyMax+=Number(qnt.qnt)
        })
    })


    function togelParts(id){
        setIsParts(pre=>{
            return pre.includes(id) ? pre.filter(item=>item!==id) : [...pre, id]
        })
    }

    const ProductsElement = Products.map(product=>{
        const PartsElement = product.parts.map(part=>{ 
            
            let notRqnt = 0
            notReadyParts.forEach(notRpart=>{
                if(part.name !== notRpart.name) return
                notRpart.qnts.forEach(qnt=>{
                    notRqnt+=Number(qnt.qnt)
                })
            })

            const workshopPart = allParts.find(item => item.name === part.name)
            let workshopQnt = 0
            workshopPart?.qnts.forEach(qnt=>{
                workshopQnt+=Number(qnt.qnt)
            })
            
            if(!part) return
            return (

                <div 
                    className={`relative ${(isUpdateAccess && part.mates) && 'cursor-pointer'}`}
                    key={part.name}
                    onClick={()=>{(isUpdateAccess && part.mates) && setEditedPart(part)}}
                >
                    <div className="line-before"></div>

                    <div 
                        className="px-2 relative w-max py-1 flex items-center justify-center gap-2 rounded-md border border-black"
                    >
                        <div
                            className='bg-stone-600 text-green-400 flex gap-2 text-base items-center p-1 rounded-lg'
                            >
                            {workshopQnt-notRqnt}
                            <FontAwesomeIcon icon={faCheck} className='text-green-400' />
                        </div>
                        <div
                            className='bg-stone-600 text-[#DCCCB3] flex gap-2 text-base items-center p-1 rounded-lg'
                            >
                            {notRqnt}
                            <FontAwesomeIcon icon={faHammer} className='text-[#DCCCB3]' />
                        </div>
                        <div>{part.name}</div>
                    </div>
                </div>
            )
        })
        return (
            <div 
                className="flex flex-col items-end justify-center"
                key={product._id}
            >
                <div 
                    className="px-2 w-max py-1 flex items-center justify-center flex-col gap-2 rounded-md border border-black"
                >
                        <div 
                            className="flex justify-center items-center gap-1 cursor-pointer"
                            onClick={()=>togelParts(product._id)}
                        >
                            {product.title}
                            <Image 
                                src={arrowDown} alt="" 
                                className={`${isParts.includes(product._id) ? 'rotate-180' :'pt-4'}`}
                            />
                        </div>
                </div>
                {isParts.includes(product._id) && 
                <div className='border-r-2 border-black pr-4 mr-8 pt-2 flex flex-col items-end gap-1'>
                    {PartsElement}
                </div>
                }
            </div>
        )
    })

    const rewMtesElement = EditedPart?.mates.map(mate=>{
        const needed = neededMates.find(item => item?.name === mate.name)
      
        return (

            <div 
                className='relative  cursor-pointer' 
                key={mate.name}
            >
                <div className="line-before"></div>

                <div 
                    className="px-2 relative w-max py-1 flex items-center justify-center flex-col gap-2 rounded-md border border-black"
                >
                    <div className="flex items-center justify-center gap-1">
                        {needed &&
                         <span className="text-red-500 font-semibold border-r border-black pr-1 ">
                            {needed.qnt}
                         </span>
                        }
                        <span>{mate.qnt}</span>
                        <span>{mate.name}</span>
                    </div>
                </div>
            </div>
        )
    })

    function updateNeededMates(total){
        // Clone the previous array to avoid mutating it directly
        const updatedNeededMates = [...neededMates];

        // Check if NeededMates already has an object with the same name
        const existingMateIndex = updatedNeededMates.findIndex(mate => mate?.name === total.name);

        if (existingMateIndex !== -1) {
            // If it exists, update its quantity
            updatedNeededMates[existingMateIndex].qnt = total.qnt;
        } else {
            // If it doesn't exist, add total to the array
            updatedNeededMates.push(total);
        }

        // Update the state with the new array
        setNeededMates(updatedNeededMates);
    };

    function calculateTotal(data, neededQnt, neededName) {

        let totalAmount = 0;
        let remainingQnt = neededQnt;
        let lastPrice = parseFloat(data[data.length - 1]?.price);

        // Iterate over the data array from the last element to the first
        for (let i = data.length - 1; i >= 0; i--) {
            let price = parseFloat(data[i].price);
            let qnt = parseInt(data[i].qnt);

            if (remainingQnt <= 0) {
                break;
            }

            if (qnt <= remainingQnt) {
                totalAmount += price * qnt;
                remainingQnt -= qnt;
            } else {
                totalAmount += price * remainingQnt;
                remainingQnt = 0;
            }
        }

        // If there is remaining quantity, continue using the last price
        if (remainingQnt > 0) {
            totalAmount += lastPrice * remainingQnt;
            return [totalAmount, {
                name: neededName,
                qnt: remainingQnt,
            }];
        }

        return totalAmount;

    }

    const plusTabelElement = [
        <table className='m-auto' key={'asdasdsd'}>
                <thead>
                    <tr>
                    <th>كمية</th>
                    <th>
                        متوسط سعر الوحدة 
                    </th>
                    <th>total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <input 
                            type="number" 
                            className="no-focus-outline bg-transparent w-full h-full"
                            placeholder="كمية"
                            value={qnt}
                            min={0}
                            onChange={(e)=>{
                                if(!emptyMate)setQnt(e.target.value)
                            }}
                        />
                    </td>
                    <td>
                        {(totalPrice/qnt).toFixed(2)}
                    </td>
                    <td>
                        {totalPrice}
                    </td>
                    </tr>
                </tbody>
        </table>
    ]

    const minusTabelElement = [
        <table className='m-auto'  key={'cvbncvn'}>
                <thead>
                    <tr>
                    <th>كمية</th>
                    <th>
                        ملاحظة
                    </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <input 
                            type="number" 
                            className="no-focus-outline bg-transparent w-full h-full"
                            placeholder="كمية"
                            value={minusQnt}
                            max={minusMax}
                            min={0}
                            onChange={(e)=>{
                                // handleRewMatesChange(Number(e.target.value)+Number(rewMate.qnt),rewMate)
                                setMinusQnt(e.target.value)
                            }}
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
                    </tr>
                </tbody>
        </table>
    ]

    const readyTabelElement = [
        <table className='m-auto'  key={'tyutyio'}>
                <thead>
                    <tr>
                    <th>كمية</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>
                        <input 
                            type="number" 
                            className="no-focus-outline bg-transparent w-full h-full"
                            placeholder="كمية"
                            value={notReadyQnt}
                            max={notReadyMax}
                            min={0}
                            onChange={(e)=>{
                                setNotReadyQnt(e.target.value)
                            }}
                        />
                    </td>
                    </tr>
                </tbody>
        </table>
    ]

    async function submitAddPart() {
        const res = await editAddPart(EditedPart.name,{qnt:qnt,price:(totalPrice/qnt).toFixed(2),ready:false},)
        EditedPart.mates.forEach(async(mate)=>{
            const res = await editMinusRewMateQnt(mate._id,mate.qnt,mate.name)
        })
        queryClient.invalidateQueries(['All parts']);
    }

    async function submitMinusPart() {
        const res = await editMinusPart(EditedPart.name,minusQnt,note)
        EditedPart.mates.forEach(async(mate)=>{
            const res = await editAddRewMateQnt(mate._id,{qnt:mate.qnt},mate.name)
        })
        queryClient.invalidateQueries(['All parts']);
    }
    
    async function submitReadyPart() {
        const res = await editReadyPart(EditedPart.name,notReadyQnt)
        queryClient.invalidateQueries(['All parts']);
    }
    



  return (
    <div className="flex flex-col items-end"> 
        <button
            className="px-8 py-3 rounded-md border border-black"
            onClick={()=>setIsProducts(pre=>!pre)}
        >
            ورشة
        </button>
        <div className="flex flex-col items-end gap-2 mt-4">
            {isProducts &&
                ProductsElement
            }
            {EditedPart.mates.length>0 &&
            <div>
            <div
               className={`${isRedBG ? 'bg-[#ff000083]':'bg-[#0000004f]'} md:p-48 p-80 z-[999] backdrop-filter backdrop-blur-md h-screen w-screen fixed top-0 right-0`}
            ></div>
                <div className={`mx-auto absolute top-1/3 -translate-y-1/3 -translate-x-40 right-0 z-[9999] w-2/3 p-4 ${plusOrMinus==='plus' ? 'bg-green-300':'bg-red-300'} flex flex-col items-center rounded-xl`}>
                    <div className="flex items-center justify-between w-full">
                        <span className='opacity-0'>.</span>
                        
                        <span className='text-2xl'>
                            {EditedPart.name}  
                        </span>
                        
                        <button 
                        className='bg-red-700 py-1 px-3 ml-2 rounded-full'
                        onClick={()=>{
                            setEditedPart({name:'',mates:[]})
                        }}
                        >
                        <FontAwesomeIcon icon={faX} className="text-white" />
                        </button>                    
                    </div>
                    <div className="flex items-start justify-around w-full">
                        <div className="flex flex-col">
                            <FontAwesomeIcon 
                                icon={faPlus} 
                                className={`text-white bg-${plusOrMinus==='minus'&&'green-200 cursor-pointer'} text-2xl p-4 `}
                                onClick={()=>{
                                    setPlusOrMinus('plus')
                                    setReady(false)
                                    setNeededMates([])
                                    setIsMax([])
                                }}
                            />
                            <FontAwesomeIcon 
                                icon={faMinus} 
                                className={`text-white ${plusOrMinus==='plus'&&'bg-red-400 cursor-pointer'} text-2xl p-4 `} 
                                onClick={()=>{
                                    setPlusOrMinus('minus')
                                    setReady(false)
                                    setNeededMates([])
                                    setIsMax([])
                                }}
                            />

                            <div 
                                className="mt-4 cursor-pointer"
                                onClick={()=>setReady(pre=>!pre)}
                            >
                                Ready
                            </div>
                        </div>
                        <div className="shadow-sm p-1">

                            {plusOrMinus==='plus' && !Ready && plusTabelElement}
                            {plusOrMinus==='minus' && !Ready && minusTabelElement}
                            {Ready && readyTabelElement}

                            <div className="flex items-center justify-center mt-4">
                                {isMax.length>0 ?
                                <div
                                    className="bg-red-500 font-semibold py-1 px-4 rounded-lg text-white"
                                >
                                    لايكنك صنع هذه الكمية
                                </div>
                                :<button 
                                    className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                                    onClick={()=>{
                                        plusOrMinus==='plus' && !Ready && submitAddPart()
                                        plusOrMinus==='minus' && !Ready && submitMinusPart()
                                        Ready && submitReadyPart()
                                        setEditedPart({name:'',mates:[]})
                                        setQnt(1)
                                        setMinusQnt(1)
                                        setEmptyMate(false)
                                        setNotReadyQnt(1)
                                        setNote('')
                                        setReady(false)
                                        setTotalPrice(0)
                                        setPlusOrMinus('plus')                                      
                                    }}
                                        >
                                    Save
                                </button>
                                }
                                
                            </div>                      
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="border border-black w-min p-1 cursor-pointer" onClick={()=>setIsDetails(pre=>!pre)}>
                                Details                           
                            </div>
                            {isDetails &&
                            <div className='border-r-2 border-black pr-4 mr-8 pt-2 flex flex-col items-end gap-1'>
                                {rewMtesElement}
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            }
        </div>
    </div>
  )
}

export default Parts