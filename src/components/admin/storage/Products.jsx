'use client'

import { faCheck, faMinus, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { editAddPart, editAddProduct, editMinusPart, editMinusProduct } from "../../../app/actions/storage";


const fetchProductsParts = async () => {
    const res = await axios.get(`/api/products/parts`);
    if(!res.data) return []
    return res.data;
}

const fetchParts = async () => {
    const res = await axios.get(`/api/storage/workshop`);
    if(!res.data) return []
    return res.data;
}

const fetchProductByName = async (title) => {
    const res = await axios.get(`/api/storage/products/${title}`);
    if(!res.data[0]) return []
    return res.data[0]
}

const fetchProductsStorage = async () => {
    const response = await fetch(`/api/storage/products`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('An error occurred while fetching the data.');
    }
    return response.json();
}


function Products({isUpdateAccess}) {

    const [EditedProduct,setEditedProduct] = useState({title:'',parts:[]});

    const { data: Products, isLoading: IsLoading, isError: IsError, error: Error } = useQuery({
        queryKey: ['parts'],
        queryFn: fetchProductsParts
    });
    const { data: StorageProducts, isLoading: IsStoragePLoading, isError: IsStoragePError, error: StoragePError } = useQuery({
        queryKey: ['Products in Storage'],
        queryFn: fetchProductsStorage
    });

    const { data: Product, isLoading: IsProductLoading, isError: IsProductError, error: ProductError } = useQuery({
        queryKey: ['prduct by title', EditedProduct.title],
        queryFn: ({ queryKey }) => fetchProductByName(queryKey[1]),
        enabled: !!EditedProduct.title,
    });

    const { data: allParts, isLoading: IsPartsLoading, isError: IsPartsError, error: PartsError } = useQuery({
        queryKey: ['All parts'],
        queryFn: fetchParts,
    });

    const [isProducts, setIsProducts] = useState(false);

    const [plusOrMinus,setPlusOrMinus] = useState('plus');

    const [isRedBG,setIsRedBG] = useState(false);

    const [isDetails, setIsDetails] = useState(false);

    const [qnt, setQnt] = useState(1);

    const [minusQnt, setMinusQnt] = useState(1);

    const [totalPrice, setTotalPrice] = useState(0);

    const [minusMax,setMinusMax] = useState(0);

    const [isMax,setIsMax] = useState([]);
    
    const [neededParts,setNeededParts] = useState([]);

    const [note,setNote] = useState('');

    const [selectedOption,setSelectedOption] = useState(null);
    
    useEffect(()=>{
        if (!Products || !EditedProduct) return;


        setEditedProduct(pre => {
            let updatedProduct = { ...pre };
        
            updatedProduct.parts = updatedProduct.parts.map(part => {
              if(!part.options.includes(selectedOption) && !part.options.includes('all')) return part
              let oldQnt = 0;
        
              Products.forEach(product => {
                  if (product.name !== pre.name || !product.parts) return;
        
                  product.parts.forEach(oldPart => {
                    if (oldPart.name === part.name) {
                        
                      oldQnt = oldPart.qnt;
                    }
                  });
              });
        
              const newQnt =plusOrMinus === 'plus' ? Number(oldQnt) * Number(qnt) : Number(oldQnt) * Number(minusQnt);
              return { ...part, qnt: newQnt };
            });
        
            return updatedProduct;
          });
        

      
    },[qnt,minusQnt,Products])

    useEffect(()=>{
        if(!allParts || !EditedProduct) return
        if(plusOrMinus === 'minus') return
        let totalAmount = 0
        allParts.forEach(part=>{
            
            const needed =EditedProduct.parts.filter(item => item.name === part.name);

            if(needed.length === 0 && !needed[0]?.options.includes(selectedOption) && !needed[0]?.options.includes('all')) return
            if(part.qnts.length === 0){
                setNeededParts(pre=>{
                    const i =pre.findIndex(item => item?.name === part.name)
                    const editepartPart = EditedProduct.parts.find(item => item?.name === part.name)
                    if(!editepartPart) return pre
                    if(i !== -1){
                        pre[i] = editepartPart
                        return pre
                    }
                    setIsMax(pre=>[...pre, editepartPart.name])
                    return [...pre, editepartPart]

                })
                return
            }
            if(!needed[0]) return

            part.qnts = part.qnts.filter(item => item.ready === true)
           
            const total = calculateTotal(part.qnts, needed[0].qnt, needed[0].name)

            if(typeof total === 'number'){
                if(isMax.includes(needed[0].name)){
                    setIsMax(pre=>pre.filter(item => item !== needed[0].name))
                    setNeededParts(pre=>{
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
                if(typeof updateNeededParts !== 'undefined'){
                    updateNeededParts(total[1])
                }
                setIsMax(pre=>{
                    if(pre.includes(total[1].name)) return pre
                    return [...pre, total[1].name]
                })
            }
            
        })
        setTotalPrice(totalAmount)
    },[EditedProduct,allParts])  
    
    // useEffect(()=>{
    //     setIsRedBG(pre=>!pre)
    //     const interval = setInterval(()=>{setIsRedBG(pre=>!pre)},250)
    //     setTimeout(()=>{clearInterval(interval)},1000)
    // },[isMax])

    useEffect(()=>{
        if(!EditedProduct) return
        EditedProduct.parts.forEach(part=>{
            if(!allParts.find(item => item?.name === part.name)){
                setNeededParts(pre=>{
                    const i = pre.findIndex(item => item?.name === part.name)
                    if(pre[i]){
                        pre[i].qnt = part.qnt
                        return pre
                    }
                    setIsMax(pre=>[...pre, part.name])
                    return [...pre, {
                        name: part.name,
                        qnt: part.qnt
                    }]
                });
            }
        })
    },[EditedProduct])


    useEffect(()=>{
        if(!Product) return
       
        let maxQnt = 0
        console.log(Product)
        if(Product.qnts)Product.qnts.forEach(qnt=>{
            if(qnt?.option !== selectedOption) return
            maxQnt+=Number(qnt.qnt)
        })
        setMinusMax(maxQnt)
        if(maxQnt === 0) setMinusQnt(0)

    },[Product,selectedOption])

    const queryClient = useQueryClient()

    if(IsLoading || IsPartsLoading||IsProductLoading||IsStoragePLoading) return <div>Loading...</div>;
    if(IsError) return <div>Error: {Error.message}</div>;
    
    if(IsPartsError) return <div>Error: {PartsError.message}</div>;

    if(IsProductError) return <div>Error: {ProductError.message}</div>;

    if(IsStoragePError) return <div>Error: {StoragePError.message}</div>;

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

    function updateNeededParts(total){
        // Clone the previous array to avoid mutating it directly
        const updatedNeededParts = [...neededParts];

        // Check if NeededMates already has an object with the same name
        const existingPartIndex = updatedNeededParts.findIndex(mate => mate?.name === total.name);

        if (existingPartIndex !== -1) {
            // If it exists, update its quantity
            updatedNeededParts[existingPartIndex].qnt = total.qnt;
        } else {
            // If it doesn't exist, add total to the array
            updatedNeededParts.push(total);
        }

        // Update the state with the new array
        setNeededParts(updatedNeededParts);
    };

    const plusTabelElement = [
        <table className='m-auto'  key={'asdasdsd'}>
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
                                // handleRewMatesChange(Number(e.target.value)+Number(rewMate.qnt),rewMate)
                                setQnt(e.target.value)
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
        <table className='m-auto'  key={'yuiyuiyui'}>
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

    const partsElement = EditedProduct?.parts.map(part=>{
        if(!part.options.includes(selectedOption) && !part.options.includes('all')) return
        const needed = neededParts.find(item => item?.name === part.name)
        return (

            <div 
                className='relative  cursor-pointer' 
                key={part.name}
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
                        <span>{part.qnt}</span>
                        <span>{part.name}</span>
                    </div>
                </div>
            </div>
        )
    })

    
    const productsElement = Products.map(product => {
        const Sproduct =StorageProducts?.find(item => item.name === product.title)
        let totalQnt = 0
  
        Sproduct?.qnts.forEach(qnt=>totalQnt=totalQnt+Number(qnt.qnt))
    

        return(
            <div
                key={product._id}
                className={`px-2 py-1 relative flex gap-1 rounded-md border border-black w-max ${isUpdateAccess && 'cursor-pointer'}`}
                onClick={()=>isUpdateAccess &&setEditedProduct(product)}
            >
                <div className="line-top"></div>
                <div
                    className='bg-stone-600 text-green-400 flex gap-2 text-base items-center p-1 rounded-lg'
                    >
                    {totalQnt}
                    <FontAwesomeIcon icon={faCheck} className='text-green-400' />
                </div>
                {product.title}
            </div>
        )
    })

    const optionsElement = EditedProduct?.options?.map((option,i) => {
        if(i === 0 && selectedOption === null) setSelectedOption(option.title)
        return (
            <div
                key={option.title}
            >
                <input 
                    type="radio" 
                    name="option" 
                    value={option.title} 
                    className="bg-transparent mr-2"
                    checked={option.title === selectedOption}
                    onClick={()=>{
                        setSelectedOption(option.title)
                        setQnt(1)
                        setMinusQnt(1)
                    }}
                    onChange={(e)=>{}}
                />
                {option.title}
            </div>
        )
    })


    function submitAddProduct() {
        try{
            editAddProduct(EditedProduct.title,{qnt:qnt,price:(totalPrice/qnt).toFixed(2),option:selectedOption},)
            EditedProduct.parts.forEach(part=>{
                if(!part.options.includes(selectedOption) && !part.options.includes('all')) return
                editMinusPart(part.name,part.qnt,'',true)
            })
        }catch(err){
            console.log(err)
        }finally{
            queryClient.invalidateQueries(['All parts'])
            queryClient.invalidateQueries(['Products in Storage'])
        }
    }
    
    function submitMinusProduct() {
        try{
            editMinusProduct(EditedProduct.title,minusQnt,note,selectedOption)
            EditedProduct.parts.forEach(part=>{
                if(!part.options.includes(selectedOption) && !part.options.includes('all')) return
                editAddPart(part.name,{qnt:part.qnt,ready:false})
            })
        }catch(err){
            console.log(err)
        }finally{
            queryClient.invalidateQueries(['Products in Storage'])
            queryClient.invalidateQueries(['All parts'])
        }
    }


    return (
    <div>
        <button
            className="px-8 py-3 rounded-md border border-black"
            onClick={() => setIsProducts(!isProducts)}
        >   
            منتج نهائي
        </button>
        {isProducts &&
        <div className="flex flex-col gap-6 items-center justify-center mt-6">
            {productsElement}
        </div>}
        {EditedProduct.parts.length>0 &&
            <div>
            <div
               className={`${isRedBG ? 'bg-[#ff000083]':'bg-[#0000004f]'} md:p-48 p-80 z-[999] backdrop-filter backdrop-blur-md h-screen w-screen fixed top-0 right-0`}
            ></div>
                <div className={`mx-auto absolute top-1/3 -translate-y-1/3 -translate-x-40 right-0 z-[9999] w-2/3 p-4 ${plusOrMinus==='plus' ? 'bg-green-300':'bg-red-300'} flex flex-col items-center rounded-xl`}>
                    <div className="flex items-center justify-between w-full">
                        <span className='opacity-0'>.</span>
                        
                        <span className='text-2xl'>
                            {EditedProduct.title}  
                        </span>
                        
                        <button 
                        className='bg-red-700 py-1 px-3 ml-2 rounded-full'
                        onClick={()=>{
                            setEditedProduct({title:'',parts:[]})
                            setQnt(1)
                            setMinusQnt(1)
                            setPlusOrMinus('plus')
                            setNeededParts([])
                            setIsMax([])
                        }}
                        >
                        <FontAwesomeIcon icon={faX} className="text-white" />
                        </button>                    
                    </div>

                    <div className="flex my-3 items-start justify-around w-2/4">
                        {optionsElement}
                    </div>

                    <div className="flex items-start justify-around w-full">
                        <div className="flex flex-col">
                            <FontAwesomeIcon 
                                icon={faPlus} 
                                className={`text-white bg-${plusOrMinus==='minus'&&'green-200 cursor-pointer'} text-2xl p-4 `}
                                onClick={()=>{
                                    setPlusOrMinus('plus')
                                    setSelectedOption(null)
                                    setQnt(1)
                                    setMinusQnt(1)
                                    setNeededParts([])
                                    setIsMax([])
                                }} 
                            />
                            <FontAwesomeIcon 
                                icon={faMinus} 
                                className={`text-white ${plusOrMinus==='plus'&&'bg-red-400 cursor-pointer'} text-2xl p-4 `} 
                                onClick={()=>{
                                    setPlusOrMinus('minus')
                                    setSelectedOption(null)
                                    setQnt(1)
                                    setMinusQnt(1)
                                    setNeededParts([])
                                    setIsMax([])
                                }}
                            />
                        </div>
                        <div className="shadow-sm p-1">
                            {plusOrMinus==='plus' 
                            ?plusTabelElement
                            :minusTabelElement
                            }
                            <div className="flex items-center justify-center mt-4">
                                {isMax.length>0 ?
                                <div
                                    className="bg-red-500 font-semibold py-1 px-4 rounded-lg text-white"
                                >
                                    لايكنك صنع هذه الكمية
                                </div>
                                :
                                <button 
                                    className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                                    onClick={()=>{
                                        plusOrMinus==='plus' && submitAddProduct()
                                        plusOrMinus==='minus' && submitMinusProduct()
                                        setEditedProduct({title:'',parts:[]})
                                        setQnt(1)
                                        setTotalPrice(0)
                                        setPlusOrMinus('plus')
                                        setNeededParts([])
                                        setIsMax([])
                                    }}
                                        >
                                    Save
                                </button>
                                }
                                
                            </div>                      
                        </div>
                        <div className="flex flex-col items-end">
                            <div 
                                className="border border-black w-min p-1 cursor-pointer" 
                                onClick={()=>setIsDetails(pre=>!pre)}
                            >
                                Details                           
                            </div>
                            {isDetails &&
                            <div className='border-r-2 border-black pr-4 mr-8 pt-2 flex flex-col items-end gap-1'>
                                {partsElement}
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
            }
    </div>
    )
}

export default Products