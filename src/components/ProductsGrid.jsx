"use client"

import axios from "axios";
import Link from "next/link";
import ProductGSkeleton from './loadings/ProductGSkeleton'
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons'
import arrow from '../../public/assets/arrow-down.svg'
import logo from '../../public/assets/logo.png'

// const fetchTags = async()=>{
//     const res = await axios.get('/api/products/tags');
//     return res.data;
// }

async function fetchProducts() {
    const res = await axios.get('/api/products');
    return res.data;
}

function ProductsGrid() {

    // const { data: Tags, isLoading:tagsloading, isError:tagsError , error:tagErr} = useQuery({
    //     queryKey:['tags'],
    //     queryFn: fetchTags
    // });

    const { data: Products, isLoading, isError, error:designErr } = useQuery({
        queryKey:['All Products'],
        queryFn: fetchProducts
    });


    const [selectedTag,setSelectedTag] = useState('all')

    const [search,setSearch] = useState('')

    const [isCustom ,setIsCustom] = useState(false)

    const [isMobileShown,setIsMobileShown] = useState(false)
    
    const [isRightShown,setIsRightShown] = useState(false)

    const [isLeftShown,setIsLeftShown] = useState(false)


    useEffect(()=>{
        if(typeof document !== 'undefined' && isCustom)document.body.classList.add('overflow-hidden');
        if(typeof document !== 'undefined' && !isCustom)document.body.classList.remove('overflow-hidden');
    },[isCustom])

    // useEffect(()=>{

    //     let tagesLimet
    //     if(window.innerWidth > 1024 ){
    //         tagesLimet = 6
    //     }else if(window.innerWidth > 640){
    //         tagesLimet = 3 
    //     }else{
    //         tagesLimet = 2 

    //     }

    //     Tags?.length >= tagesLimet
    //     ?setIsRightShown(true)
    //     :setIsRightShown(false)
        
    // },[Tags])

    if (isLoading) return <ProductGSkeleton />;

    if (isError) return <div>Error: {designErr.message}</div>;

    // if (tagsloading) return <ProductGSkeleton />;

    // if (tagsError) return <div>Error: {tagErr.message}</div>;

    if(!Products)return

    const firstEightProducts = [];
    const restOfTheProducts = [];
    let counter = 0;


    Products.forEach((product, index) => {
        if(!product.active) return
        const priceElement = product.options?.map((option,i)=>{
            return(
                <div 
                 className="price-after-sale "
                 key={i}
                >
                    {option.price} 
                    {i !== product.options.length - 1 
                     && <span className=' w-4 h-2 inline-block border-t-[2px] mx-2 border-black text-center'></span>
                    }
                </div>
            )
        })

        if (
            (product.title.toLowerCase().includes(search.toLowerCase()) || 
            product.description.toLowerCase().includes(search.toLowerCase()) || search === "")
        ) {
            const productElement = (
                <Link 
                 key={product._id} 
                 className="product-card" 
                 href={`/landingPages/${product._id}`}
                >
                    <div className="product-img-container">
                        <img alt="" src={`${product.imageOn}`} width={20} height={20} className="product-img product-img-on" />
                        <img alt="" src={`${product.imageOff}`} width={20} height={20} className="product-img product-img2 product-img-off" />
                    </div>
                    <div className="card-info">
                        <span className="product-title">{product.title}</span>
                        <span className="flex items-center">
                            {priceElement.length>0 
                             ?priceElement
                             :product.price
                            }
                            DA
                        </span>
                    </div>
                </Link>
            );

            counter++;

            let counterLimite

            if(window.innerWidth >= 990) counterLimite=16
            if(window.innerWidth < 990) counterLimite=8
            // Add to firstEightProducts array if counter is less than 8
            if (counter < counterLimite) {
                firstEightProducts.push(productElement);
            } else {
                restOfTheProducts.push(productElement);
            }

            counter++;
        }
    });

    
    // const filterElement = Tags.map (tag=>(
    //     <div 
    //      key={tag.name}
    //      className={` 
    //       ${selectedTag ===tag.name
    //         ?'bg-[#68552a] text-[#dcccb3]'
    //         : 'bg-[#4a3623] text-[#dcccb3] hover:bg-[#68552a]'}
    //       cursor-pointer px-4 py-1 rounded-xl capitalize ml-4`}
    //      onClick={()=>setSelectedTag(tag.name)}
    //     >
    //         {tag.name
    //     }</div>
    // ))

    function togelMobileSearch(){
        console.log('s')
        setIsMobileShown(pre=>!pre)
    }
    function togelCustomDesin(){
        setIsCustom(pre=>!pre)
    }

    function handleRightArrow(){
        setIsLeftShown(true)
        setIsRightShown(false)
    }
    
    function handleLeftArrow(){
        setIsLeftShown(false)
        setIsRightShown(true)
        
    }

    
    return (
        <div>
            <div className="flex items-center mt-14 lg:flex-row lg:justify-end text-start relative">
                {isRightShown && 
                    <div className="flex absolute bg-[#DCCCB3] z-50 lg:left-[570px] sm:left-[370px] left-[270px]">
                    <div
                    className='bg-gradient-to-r rounded-e-xl from-gray-900 to-stone-300 z-50 w-8 h-8'
                    >                       
                    </div>
                    <button
                        className=" flex justify-center items-center hover:bg-gray-400 transition-all rounded-full w-8 h-8 -rotate-90 "
                        onClick={handleRightArrow} 
                    >
                        <img 
                        src={arrow} 
                        width={20} height={20}
                        alt="" 
                        />
                    </button>
                </div>
                }
                {isLeftShown && 
                    <div className="flex absolute left-0 z-50 bg-[#DCCCB3]">
                        
                        <button
                         className=" flex justify-center items-center hover:bg-gray-400 transition-all rounded-full w-8 h-8 rotate-90 "
                         onClick={handleLeftArrow} 
                        >
                            <img 
                            src={arrow}
                            width={20} height={20} 
                            alt="" 
                            />
                        </button>

                        <div
                        className='bg-gradient-to-l rounded-s-xl from-gray-900 to-stone-300 z-50 w-8 h-8'
                        >                       
                        </div>
                    </div>
                }

                {/* <div className="lg:max-w-[600px] sm:max-w-[400px] max-w-[300px]  overflow-hidden">
                    <div 
                     className={`flex my-8 relative transition-all
                        ${isLeftShown
                            ?'lg:translate-x-[-300px] sm:translate-x-[-200px] translate-x-[-150px]'
                            :'translate-x-0'}`}
                    >
                        <div 
                            className={` 
                            ${selectedTag ==='all'
                            ?'bg-[#68552a] text-[#dcccb3]'
                            :'bg-[#4a3623] text-[#dcccb3] hover:bg-[#68552a]'}
                            px-4 py-1 rounded-xl cursor-pointer`}
                            onClick={()=>setSelectedTag('all')}
                            >
                                All
                        </div>
                        {filterElement}
                    </div>
                </div> */}

                <div className="hidden lg:block absolute right-0 -top-[94px]">
                    <FontAwesomeIcon 
                     icon={faMagnifyingGlass}
                     className={`pt-2 text-[#dcccb3] pointer-events-none z-10 absolute right-2 ${search?'hidden':'opacity-50'}`}
                    />
                    <input 
                     id="search"
                     type='search' 
                     placeholder={`Search`}
                     className='w-64 px-2 py-1 rounded-xl border-2 border-[#4a3623] no-focus-outline text-[#dcccb3] placeholder-[#dcccb3] bg-[#4a3623]' 
                     onChange={(e)=>setSearch(e.target.value)}
                    />
                </div>

                <div 
                 onClick={togelMobileSearch}
                 className={`fixed right-0 top-0 w-screen z-[9999] h-screen bg-black ${isMobileShown?'opacity-50':'hidden'} `}
                >
                 
                </div>
                <div className={`fixed right-0 ${isMobileShown?'top-0':'-top-32'} z-[99999] w-full flex bg-[#DCCCB3] items-center justify-center h-20 `}>
                    <input 
                     id="search"
                     type='search' 
                     placeholder={`Search`}
                     className='w-64 px-2 py-1 rounded-xl border-2 border-[#4a3623] no-focus-outline text-[#dcccb3] placeholder-[#dcccb3] bg-[#4a3623]' 
                     onChange={(e)=>setSearch(e.target.value)}
                    />
                    <div
                     onClick={togelMobileSearch}
                     className="ml-6 cursor-pointer"
                    >X</div>
                </div>
            </div>

            <div 
             onClick={togelMobileSearch}
             className="lg:hidden cursor-pointer z-50 hover:bg-gray-400 px-2 py-1 rounded-full absolute right-14 top-20"
            >
                {/* <FontAwesomeIcon 
                    icon={faMagnifyingGlass}                 
                /> */}
            </div>

            <div className="product-grid">
                {firstEightProducts}
            </div>

            {isCustom &&
             <div 
              onClick={togelCustomDesin}
              className="bg-black opacity-30 h-screen w-screen fixed top-0 right-0"
              >
             </div>
            } 

            {isCustom &&
            <div
             className='fixed h-screen  w-screen top-0 backdrop-filter backdrop-blur-sm right-0 z-[999]'
            >
                <div
                 className='bg-white w-96 h-[500px] relative mt-52 m-auto rounded-2xl shadow-sm shadow-slate-200'
                >
                    <div
                     className="p-4 bg-zinc-200 flex items-center rounded-t-2xl border-b-2 border-gray-300 justify-between"
                    > 
                        <FontAwesomeIcon 
                         icon={faArrowLeft} 
                         onClick={togelCustomDesin}
                         className="hover:bg-gray-300 p-2 rounded-full"                    
                        />
                        <div>
                            <img 
                            src={logo}
                            width={30} height={24}
                            className='h-11 w-auto rounded-full '
                            alt=""
                            />
                            <div className="text-sm mr-2">Drawlys</div>
                         </div>
                        <div className='text-zinc-200'>!</div>
                    </div>

                    <div className="mt-16 mb-2 pl-5 pr-2 py-2 rounded-r-2xl bg-zinc-200 w-max">
                        السلام عليكم
                    </div>
                    <div className="pl-5 pr-2 py-2 rounded-r-2xl bg-zinc-200 w-max">
                        الرجاء التواصل معنا في <br />
                        لطلب تصميم خاص
                        Instgram
                    </div>
                    <a 
                     className="h-10 cursor-pointer flex items-center justify-between px-4 w-80 rounded-lg border-2 border-zinc-200 bg-transparent absolute bottom-4 right-8 "
                     href={`${window.innerWidth >1024 ?'https://www.instagram.com':"instagram:/"}/direct/t/17847607758008114`}
                    >
                        <div>Message</div>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </a>

                </div>
            </div>
            }

           {restOfTheProducts &&
                <div className="flex my-32 items-center">
                
                    {/* <img 
                     src={randomImg1} 
                     alt="" 
                     width={120} height={120} 
                     className='rounded-full lg:w-64 lg:h-64 md:w-56 md:h-56 sm:w-40 sm:h-40' 
                    /> */}

                    {/* <div 
                     key="layer" 
                     onClick={togelCustomDesin}
                     className="w-full flex cursor-pointer items-center justify-center shadow-lg mx-10 h-32 bg-gray-200 py-4 text-center rounded-lg"
                    >
                        Add custom design
                    </div> */}

                    {/* <img 
                     src={randomImg2} 
                     alt="" 
                     width={120} height={120} 
                     className='rounded-full lg:w-64 lg:h-64 md:w-56 md:h-56 sm:w-40 sm:h-40' 
                    /> */}

                </div>
            }
            <div className="product-grid">
                {restOfTheProducts}
            </div>
        </div>
    );
}

export default ProductsGrid;
