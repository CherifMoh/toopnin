"use client"

import Link from 'next/link'
import axios from "axios";
import { useQuery, useQueryClient, } from '@tanstack/react-query';
import Image from 'next/image';
import {deleteProduct} from '../../actions/product'
import { useEffect, useState } from 'react';
import Spinner from '../../../components/loadings/Spinner';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { faCircleInfo, faMagnifyingGlass, faMinus, faPen, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { realTimeActiveUsersReport, ActiveUsersReport } from '../../actions/googleAnalytics';
import landingPageIcon from '../../../../public/assets/landingPageIcon.png';
import '../../../styles/pages/orders.css'
import { editAddProduct, editMinusProduct } from '../../actions/storage';

async function fetchProducts() {
    const res = await axios.get('/api/products');
    return res.data;
}

function Page() {

    const queryClient = useQueryClient()

    const { data: products, isLoading, isError } = useQuery({
        queryKey:['products'],
        queryFn: fetchProducts
    });

    const [deleting,setDeleting] = useState([])

    const [isCreateAccess, setIsCreateAccess] = useState(false)
    const [isUpdateAccess, setIsUpdateAccess] = useState(false)
    const [isDeleteAccess, setIsDeleteAccess] = useState(false)

    const [inActive, setInActive] = useState(false)

    const [realTimeActiveUsers, setRealTimeActiveUsers] = useState([])
    const [allActiveUsers, setAllActiveUsers] = useState([])

    const [selectedTimeOfAU, setSelectedTimeOfAU] = useState('today')

    const [isPlus, setIsPlus] = useState(null)
    const [isMinus, setIsMinus] = useState(null)

    const [search, setSearch] = useState('')

    const [minusQnt, setMinusQnt] = useState(0)
    const [note, setNote] = useState('')

    const [plusQnt, setPlusQnt] = useState(0)
    const [plusPrice, setPlusPrice] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)

    const accessibilities = useSelector((state) => state.accessibilities.accessibilities)

    const router = useRouter()

    useEffect(()=>{
        if(accessibilities.length === 0)return
        const access = accessibilities.find(item=>item.name === 'products')
        if(!access || access.accessibilities.length === 0){
            router.push('/admin')
        }
        setIsDeleteAccess(access.accessibilities.includes('delete'))
        setIsUpdateAccess(access.accessibilities.includes('update'))
        setIsCreateAccess(access.accessibilities.includes('create'))
    },[accessibilities])

    useEffect(()=>{
        setInterval(async() => {
            const response = await realTimeActiveUsersReport()
            setRealTimeActiveUsers(response)
        }, 60000);
    },[])

    useEffect(()=>{
       setTotalPrice(Number(plusQnt)*Number(plusPrice))
    },[plusQnt, plusPrice])

    useEffect(()=>{
       handelSelectTimeActiveUsers(selectedTimeOfAU)
    },[selectedTimeOfAU])

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching products</div>;

    
    async function handelSelectTimeActiveUsers(time){
        const allpages = await ActiveUsersReport(time)

        const landingPages = allpages
            .filter(item => item.pagePath.startsWith('/landingPages/'))
            .map(item => ({
            ...item,
            pagePath: item.pagePath.replace('/landingPages/', '')
            }));        
        setAllActiveUsers(landingPages)
    }
    
    function handleDelete (id){

        try {
            setDeleting(pre=>([...pre,{
                id:id,
                state:true
            }]))
            deleteProduct(id)
            queryClient.invalidateQueries('products')
        } catch (error) {
            console.log(error)
        }

        queryClient.invalidateQueries('products')
        
       
    }

    function filterProducts(product) {
       
        const searchLower = search.toLowerCase();

       
        const isMatchingSearch = (
            product.title.toLowerCase().includes(searchLower) ||
            product.price.toString().includes(searchLower) ||
            product.reference?.toLowerCase().includes(searchLower) 
        );

        let isMatchingTraking = true
        

      
        let isActive = true

        if(product.active === false && !inActive) isActive = false
        

        return isActive && (isMatchingSearch && isMatchingTraking);
    }

    async function submitAddProductStorage(id){
        const res = await editAddProduct(id,{qnt:plusQnt,price:plusPrice})
        queryClient.invalidateQueries('products')
        // console.log(res)
    }

    function plusTabelElement(product){
    return [
        <div className="shadow-lg p-1 absolute top-0 right-0 bg-white z-20" key={product._id}>
            <table className='m-auto' >
                <thead>
                    <tr>
                    <th className='whitespace-nowrap p-4'>كمية</th>
                    <th className='whitespace-nowrap p-4'>
                         سعر الوحدة 
                    </th>
                    <th className='whitespace-nowrap p-4'>total</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td className='whitespace-nowrap p-4'>
                        <input 
                            type="number" 
                            className="no-focus-outline bg-transparent w-full min-w-16 h-full"
                            placeholder="كمية"
                            value={plusQnt}
                            min={0}
                            onChange={(e)=>setPlusQnt(e.target.value)}
                        />
                    </td>
                    <td className='whitespace-nowrap p-4'>
                        <input 
                            type="text" 
                            className="no-focus-outline bg-transparent w-full min-w-16 h-full"
                            placeholder="السعر"
                            value={plusPrice}
                            min={0}
                            onChange={(e)=>setPlusPrice(e.target.value)}
                        />
                    </td>
                    <td className='whitespace-nowrap p-4'>
                        {totalPrice}
                    </td>
                    </tr>
                </tbody>
            </table>   
            <div className="flex items-center justify-center mt-4">
            
                <button 
                    className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                    onClick={()=>{
                        submitAddProductStorage(product._id)
                        setIsPlus(null)
                        setPlusPrice(0)
                        setPlusQnt(0)
                        setTotalPrice(0)
                    }}
                        >
                    Save
                </button>
                
                
            </div>                      
        </div>
    ]
    }

    async function submitMinusProductStorage(id){
        const res = await editMinusProduct(id,minusQnt,note)
        queryClient.invalidateQueries('products')
        // console.log(res)
    }

    function minusTabelElement(product,minusMax){
        return [
            <div className="shadow-lg p-1 absolute top-0 right-0 bg-white z-20"  key={product._id}>
                <table className=' w-48'>
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
                                className="no-focus-outline min-w-28 bg-transparent w-full h-full"
                                placeholder="كمية"
                                value={minusQnt}
                                max={minusMax}
                                min={0}
                                onChange={(e)=>setMinusQnt(e.target.value)}
                            />
                        </td>
                        <td>
                            <input 
                                type="text" 
                                className="no-focus-outline min-w-36 bg-transparent w-full h-full"
                                placeholder="ملاحظة"
                                onChange={(e)=>setNote(e.target.value)}
                            />
                        </td>
                        </tr>
                    </tbody>
                </table>   
                <div className="flex items-center justify-center mt-4">
                {minusQnt > minusMax 
                ?<div
                    className="bg-red-500 font-semibold py-1 px-4 rounded-lg text-white"
                >
                    لايكنك صنع هذه الكمية
                </div>
                :  
                <button 
                    className='bg-gray-900 w-48 rounded-lg pb-1 text-white'
                    onClick={()=>{
                        submitMinusProductStorage(product._id)
                        setIsMinus(null)
                        setMinusQnt(0)
                        setPlusQnt(0)
                        setTotalPrice(0)
                    }}
                        >
                    Save
                </button>
                }
                    
                </div>                      
            </div>
           
        ]
    }

    const productsElemnts = products.map(product=>{
        if(!filterProducts(product)) return null
        let stock = 0
  
        product?.qnts.forEach(qnt=>stock=stock+Number(qnt.qnt))
        const realTimeUsers = realTimeActiveUsers.filter(page => page.pagePath === product.title)
        const selectedTimeUsers = allActiveUsers.filter(page => page.pagePath === product._id)
        return (
            <tr key={product._id} className='h-5 flex-none'>
                <td className='w-24'>
                    <div>#{product.reference}</div>
                </td>
                <td className='w-24'>
                    <img src={product.imageOn} width={96} height={96} alt="" />
                </td>
                <td>{product.title}</td>
                <td>{product.price}</td>
                <td>
                    <div className='w-full relative p-4 flex items-center justify-around'>
                        <FontAwesomeIcon  
                            icon={faPlus} 
                            className='text-green-400 z-10 font-bold cursor-pointer' 
                            onClick={()=>setIsPlus(product._id)}
                        />
                        <span>{stock}</span>
                        <FontAwesomeIcon  
                            icon={faMinus}  
                            className='text-red-400 z-10 font-bold cursor-pointer'
                            onClick={()=>setIsMinus(product._id)}
                        />
                        {isPlus === product._id && plusTabelElement(product)}
                        {isMinus === product._id && minusTabelElement(product,stock)}
                    </div>
                </td>
                <td>{realTimeUsers.length !== 0 ? realTimeUsers[0].activeUsers : 0}</td>
                <td>{selectedTimeUsers.length !== 0 ? selectedTimeUsers[0].activeUsers : 0}</td>
                <td>
                    <div className='flex items-center gap-3'>
                        {isUpdateAccess &&
                            <Link href={`/admin/products/${product._id}`} className='cursor-pointer p-2 rounded-md'>
                                <FontAwesomeIcon  icon={faPen} />
                            </Link>
                        }
                        {product.landingPageImages.length > 0 &&
                            <Link href={`/landingPages/${product._id}`} className='cursor-pointer p-2 rounded-md'>
                                <Image  
                                    src={landingPageIcon} alt=''
                                    width={20} height={20}
                                />
                            </Link>
                        }
                        {isDeleteAccess && deleting.some(item => item.id === product._id && item.state) &&
                            <Spinner size={'h-8 w-8'} color={'border-red-500'} />
                        }  
                        {isDeleteAccess && !deleting.some(item => item.id === product._id && item.state) &&
                            <button
                                className=' p-2 rounded-md cursor-pointer'
                                onClick={() => handleDelete(product._id)}
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </button>                            
                        }  
                    </div>
                
                </td>
            </tr>
        )
        
    })

    const tHeades =[
        {name:'Reference'},
        {name:'Image'},
        {name:'Title'},
        {name:'Price'},
        {name:'Stock'},
        {name:'active users'},
        {name:'users'},
        {name:'Actions'},
    ]

    const tHeadesElements=tHeades.map(tHead=>(
        <th key={tHead.name} className='whitespace-nowrap'>{tHead.name}</th>
    ))


  return (
    <div className='py-4 relative pl-4 pr-48 flex flex-col gap-5 h-screen overflow-x-auto w-full min-w-max'  >
        <div className='flex z-50 items-center w-full justify-around p-14'>
            <div className='flex justify-center relative '>
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                    className={`pointer-events-none absolute left-60 top-4 ${search ? 'hidden' : 'opacity-50'}`}
                />
                <FontAwesomeIcon
                    icon={faX}
                    className={`cursor-pointer h-4 absolute left-60 top-4 ${!search ? 'hidden' : 'opacity-50'}`}
                    onClick={() => setSearch('')}
                />
                <input
                    id="search"
                    type='search'
                    className='w-64 px-2 py-1 m-2 rounded-xl border border-[rgba(0, 40, 100, 0.12)] no-focus-outline text-black bg-transparent'
                    placeholder={`Search`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>


            <div
                className={`justify-self-end whitespace-nowrap rounded-xl border p-2 px-4 cursor-pointer ${
                    !inActive
                        ? 'border-green-500 text-green-600'
                        : 'border-gray-400 text-gray-600'
                }`}
                onClick={() => setInActive(pre => !pre)}
            >
                {!inActive ? 'Active' : 'Inactive'}
            </div>


            <div>
                <select 
                    onChange={(e)=>setSelectedTimeOfAU(e.target.value)}
                    className='justify-self-end  whitespace-nowrap rounded-xl border border-[rgba(0, 40, 100, 0.12)] p-2 px-4 bg-stone-100 cursor-pointer'
                >
                    <option value="today">Today</option>
                    <option value="this week">This week</option>
                    <option value="this month">This month</option>
                    <option value="maximum">Maximum</option>
                </select>
            </div>




            {isCreateAccess &&
                <Link
                    className='justify-self-end  whitespace-nowrap rounded-xl border border-[rgba(0, 40, 100, 0.12)] no-focus-outline text-black bg-transparent p-2 px-4 cursor-pointer'
                    href={'/admin/products/add'}
                    >
                    <FontAwesomeIcon icon={faPlus} />
                    <span className="ml-2 whitespace-nowrap">Add a new product</span>
                </Link>
            }

            <Link
                className='justify-self-end  whitespace-nowrap rounded-xl border border-[rgba(0, 40, 100, 0.12)] no-focus-outline text-black bg-transparent p-2 px-4 cursor-pointer'
                href={'/admin/products/archive'}
            >
                <span className="ml-2 whitespace-nowrap">Archive</span>
            </Link>
           

        </div>
        <div className='flex z-50 items-center justify-center w-full'>
            <table className='font-normal h-1 w-full flex-shrink-0 bg-stone-100' style={{ borderSpacing: '0' }}>
                <thead>
                    <tr>
                        {tHeadesElements}
                    </tr>
                </thead>
                <tbody>
                    {productsElemnts}
                </tbody>
            </table>
        </div>
        <div
            className='fixed bottom-0 left-0 right-0 w-full h-full'
            onClick={()=>{
                setIsPlus(pre=>{
                    if(pre) return null
                    return pre
                })
                setPlusPrice(0)
                setPlusQnt(0)
                setTotalPrice(0)
                setIsMinus(pre=>{
                    if(pre) return null
                    return pre
                })
            }}
        ></div>
    </div>
  )
}

export default Page