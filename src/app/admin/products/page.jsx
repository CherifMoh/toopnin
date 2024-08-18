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
import { faCircleInfo, faMagnifyingGlass, faPen, faPlus, faX } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { realTimeActiveUsersReport, ActiveUsersReport } from '../../actions/googleAnalytics';
import landingPageIcon from '../../../../public/assets/landingPageIcon.png';
import '../../../styles/pages/orders.css'

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

    const [realTimeActiveUsers, setRealTimeActiveUsers] = useState([])
    const [allActiveUsers, setAllActiveUsers] = useState([])

    const [selectedTimeOfAU, setSelectedTimeOfAU] = useState('today')

    const [search, setSearch] = useState('')

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
        

      
        const isMatchingDateFilter = true
        // const isMatchingDateFilter = (
        //     dateFilter === 'today' && createdDate === currentDate ||
        //     dateFilter === 'yesterday' && createdDate === yesterdayDate ||
        //     dateFilter === 'this Week' && isWithinPastWeek(createdDate) ||
        //     dateFilter === 'this Month' && isDateInPastMonth(createdDate) ||
        //     dateFilter === 'maximum'
        // );

        return isMatchingDateFilter && (isMatchingSearch && isMatchingTraking);
    }

    const productsElemnts = products.map(product=>{
        if(!filterProducts(product)) return null
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
                <td>{realTimeUsers.length !== 0 ? realTimeUsers[0].activeUsers : 0}</td>
                <td>{selectedTimeUsers.length !== 0 ? selectedTimeUsers[0].activeUsers : 0}</td>
                <td>
                    {
                        product.title === 'Led Painting' 
                        ?
                        <div className='flex items-center gap-3'>
                            <Link href={`/admin/products/led-designs`} className='p-2 rounded-md'>
                                <FontAwesomeIcon  icon={faCircleInfo} />
                            </Link>
                            {isUpdateAccess &&
                                <Link href={`/admin/products/${product._id}`} className=' p-2 rounded-md'>
                                    <FontAwesomeIcon  icon={faPen} />
                                </Link>
                            }
                            {product.landingPageImages.length > 0 &&
                                <Link href={`/landingPages/${product._id}`} className=' p-2 rounded-md'>
                                    <Image  
                                        src={landingPageIcon} alt=''
                                        width={32} height={32}
                                    />
                                </Link>
                            }
                            {isDeleteAccess && deleting.some(item => item.id === product._id && item.state) &&
                                <Spinner size={'h-8 w-8'} color={'border-red-500'} />
                            }  
                            {isDeleteAccess && !deleting.some(item => item.id === product._id && item.state) &&
                                <button
                                    className=' p-2 rounded-md'
                                    onClick={() => handleDelete(product._id)}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>                            
                            }  
                            
                        </div>
                        :<div className='flex items-center gap-3'>
                        {isUpdateAccess &&
                                <Link href={`/admin/products/${product._id}`} className=' p-2 rounded-md'>
                                    <FontAwesomeIcon  icon={faPen} />
                                </Link>
                            }
                            {product.landingPageImages.length > 0 &&
                                <Link href={`/landingPages/${product._id}`} className=' p-2 rounded-md'>
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
                                    className=' p-2 rounded-md'
                                    onClick={() => handleDelete(product._id)}
                                >
                                    <FontAwesomeIcon icon={faTrashCan} />
                                </button>                            
                            }  
                        </div>
                    }
                </td>
            </tr>
        )
        
    })

    const tHeades =[
        {name:'Reference'},
        {name:'Image'},
        {name:'Title'},
        {name:'Price'},
        {name:'active users'},
        {name:'users'},
        {name:'Actions'},
    ]

    const tHeadesElements=tHeades.map(tHead=>(
        <th key={tHead.name}>{tHead.name}</th>
    ))

   

  return (
    <div className='overflow-x-scroll min-h-svh py-4 pl-4'>
        <div className='flex items-center justify-around p-14'>
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
           

        </div>
        <div className='flex items-center justify-center w-full'>
            <table className='font-normal h-1 w-full bg-stone-100' style={{ borderSpacing: '0' }}>
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
    </div>
  )
}

export default Page