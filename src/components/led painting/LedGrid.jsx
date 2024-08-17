"use client"

import axios from "axios";
import Link from "next/link";
import ProductGSkeleton from '../loadings/ProductGSkeleton'
import { useQueryClient, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faPaperPlane } from '@fortawesome/free-regular-svg-icons'
import arrow from '../../../public/assets/arrow-down.svg'
import logo from '../../../public/assets/logo.png'
import { useInView } from "react-intersection-observer";
import debounce from 'lodash.debounce';

const fetchTags = async () => {
    const res = await axios.get('/api/products/tags');
    return res.data;
}

async function fetchDesigns({ pageParam = 1 }) {
    const res = await axios.get(`/api/products/ledDesigns?page=${pageParam}`);
    return res.data;
}

const fetchLedPainting = async () => {
    const res = await axios.get(`/api/products/LedPainting`);
    return res.data[0];
}

function ProductsGrid() {


    const { data: Tags, isLoading: tagsloading, isError: tagsError, error: tagErr } = useQuery({
        queryKey: ['tags'],
        queryFn: fetchTags
    });

    const { ref, inView } = useInView();

    const filterElementRef = useRef(null)
    const filterContRef = useRef(null)

    const { data: DesignsPages, error: designsErr, fetchNextPage, hasNextPage, isFetchingNextPage, status, } = useInfiniteQuery({
        queryKey: ['Designs infinite'],
        queryFn: fetchDesigns,
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage
    });

    const { data: ledPainting, isLoading: ledLoading, isError: ledIsError, error: ledError } = useQuery({
        queryKey: ['products'],
        queryFn: fetchLedPainting
    });

    const [selectedTag, setSelectedTag] = useState('all')

    const [search, setSearch] = useState('')

    const [isCustom, setIsCustom] = useState(false)

    const [isMobileShown, setIsMobileShown] = useState(false)

    const [isRightShown, setIsRightShown] = useState(false)

    const [isLeftShown, setIsLeftShown] = useState(false)

    const [isVisible, setIsVisible] = useState(false);

    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 0
    );

    const [filterWidth, setFilterWidth] = useState(0);
    const [filterContWidth, setFilterContWidth] = useState(0);

    const [rightCounter, setRightCounter] = useState(0);


    useEffect(() => {
        if (filterElementRef.current) {
            setFilterWidth(filterElementRef.current.offsetWidth);
        }
        if (filterContRef.current) {
            setFilterContWidth(filterContRef.current.offsetWidth);
        }
    }, [Tags, DesignsPages, ledPainting]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            // Exit early if window is not defined (e.g., during server-side rendering)
            return;
        }

        const handleResize = debounce(() => {
            setWindowWidth(window.innerWidth);
        }, 100);

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            handleResize.cancel();
        };
    }, []);

    useEffect(() => {
        // Set isVisible to true after a certain delay or any other condition
        setIsVisible(false)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 500); // Adjust the delay as needed

        return () => clearTimeout(timer);
    }, [isCustom]);

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage])

    useEffect(() => {
        if (typeof document !== 'undefined' && isCustom) document.body.classList.add('overflow-hidden');
        if (typeof document !== 'undefined' && !isCustom) document.body.classList.remove('overflow-hidden');
    }, [isCustom])

    useEffect(() => {
        (filterWidth / (windowWidth - 50)) > 1
            ? setIsRightShown(true)
            : setIsRightShown(false)
    }, [filterWidth, windowWidth])

    if (status === 'pending') return <ProductGSkeleton />;

    if (status === 'error') return <div>Error: {designsErr.message}</div>;

    if (tagsloading) return <ProductGSkeleton />;

    if (tagsError) return <div>Error: {tagErr.message}</div>;

    if (ledLoading) return <ProductGSkeleton />;

    if (ledIsError) return <div>Error: {ledError.message}</div>;

    const Designs = DesignsPages?.pages

    if (!Designs) return

    const firstEightProducts = [];
    const restOfTheProducts = [];
    let counter = 0;



    const priceElement = ledPainting.options?.map((option, i) => {
        return (
            <div
                className="price-after-sale "
                key={i}
            >
                {option.price}
                {i !== ledPainting.options.length - 1
                    && <span className=' w-4 h-2 inline-block border-t-[2px] mx-2 border-black text-center'></span>
                }
            </div>
        )
    })

    Designs?.forEach((designs) => {
        designs?.data.forEach((design, index) => {
            if (

                (design.tags.includes(selectedTag) || selectedTag === "all") &&
                (design.title.toLowerCase().includes(search.toLowerCase()) || design.description.toLowerCase().includes(search.toLowerCase()) || search === "")
            ) {

                const productElement = (
                    <Link
                        key={design._id}
                        ref={designs.data.length - 12 === index + 1 ? ref : null}
                        className="product-card"
                        href={`/led-painting/${design._id}`}
                    >
                        <div className="aspect-square product-img-container">
                            <img 
                                src={`${design.imageOn}`} alt="" 
                                width={20} height={20} 
                                className="product-img product-img-on" 
                            />
                            <img 
                                src={`${design.imageOff}`} alt="" 
                                width={20} height={20} 
                                className="product-img product-img2 product-img-off" 
                            />
                        </div>
                        <div className="card-info">
                            <span className="product-title">{design.title}</span>
                            <span className="flex items-center">
                                {priceElement} DA
                            </span>
                        </div>
                    </Link>
                );

                counter++;

                let counterLimite

                if (window.innerWidth >= 990) counterLimite = 16
                if (window.innerWidth < 990) counterLimite = 8
                // Add to firstEightProducts array if counter is less than 8
                if (counter < counterLimite) {
                    firstEightProducts.push(productElement);
                } else {
                    restOfTheProducts.push(productElement);
                }

                counter++;
            }
        });
    });


    const filterElement = Tags.map(tag => (
        <div
            key={tag.name}
            className={` 
          ${selectedTag === tag.name
                    ? 'bg-[#68552a] text-[#dcccb3]'
                    : 'bg-[#4a3623] text-[#dcccb3] hover:bg-[#68552a]'}
          cursor-pointer px-4 py-1 rounded-xl capitalize ml-4`}
            onClick={() => setSelectedTag(tag.name)}
        >
            {tag.name
            }</div>
    ))

    function togelMobileSearch() {
        console.log('s')
        setIsMobileShown(pre => !pre)
    }
    function togelCustomDesin() {
        setIsCustom(pre => !pre)
    }

    function handleRightArrow() {
        setRightCounter(pre => pre + 1)
        const eleEnCont = Math.floor(filterWidth / filterContWidth / 0.5 - 1)
        if (rightCounter === eleEnCont) setIsRightShown(false)
        setIsLeftShown(true)

    }

    function handleLeftArrow() {
        setRightCounter(pre => pre - 1)
        if (rightCounter - 1 === 0) {
            setIsLeftShown(false)
            setIsRightShown(true)
        }

    }

    const filterElemStyle = {
        transform: `translateX(-${(filterContWidth / 2 * rightCounter)}px)`
    };

    const filterContStyle = {
        width: `${windowWidth < 1005 ? `calc(${windowWidth}px - 50px)` : '844px'}`
    };

    const RightBStyle = {
        left: `calc(${windowWidth}px - 100px)`
    };



    return (
        <div>
            <div className="flex items-center lg:flex-row lg:justify-between text-start relative">
                {isRightShown &&
                    <div
                        style={RightBStyle}
                        className="flex absolute bg-[#DCCCB3] z-50"
                    >
                        <div
                            className='bg-gradient-to-r rounded-e-xl from-[#4a3623] to-[#DCCCB3] z-50 w-8 h-8'
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
                            className='bg-gradient-to-l rounded-s-xl from-[#4a3623] to-[#DCCCB3] z-50 w-8 h-8'
                        >
                        </div>
                    </div>
                }

                <div
                    className={`overflow-hidden`}
                    style={filterContStyle}
                    ref={filterContRef}
                >
                    <div
                        className={`flex my-8 relative transition-all w-min`}
                        ref={filterElementRef}
                        style={filterElemStyle}
                    >
                        <div
                            className={` 
                            ${selectedTag === 'all'
                                    ? 'bg-[#68552a] text-[#dcccb3]'
                                    : 'bg-[#4a3623] text-[#dcccb3] hover:bg-[#68552a]'}
                            px-4 py-1 rounded-xl cursor-pointer`}
                            onClick={() => setSelectedTag('all')}
                        >
                            All
                        </div>
                        {filterElement}
                    </div>
                </div>

                <div className="hidden lg:block">
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className={`pt-2 text-[#dcccb3] pointer-events-none z-10 absolute right-2 ${search ? 'hidden' : 'opacity-50'}`}
                    />
                    <input
                        id="search"
                        type='search'
                        placeholder={`Search`}
                        className='w-64 px-2 py-1 rounded-xl border-2 border-[#4a3623] no-focus-outline text-[#dcccb3] placeholder-[#dcccb3] bg-[#4a3623]'
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div
                    onClick={togelMobileSearch}
                    className={`fixed right-0 top-0 w-screen z-[9999] h-screen bg-black ${isMobileShown ? 'opacity-50' : 'hidden'} `}
                >

                </div>
                <div className={`fixed right-0 ${isMobileShown ? 'top-0' : '-top-32'} z-[99999] w-full flex bg-[#DCCCB3] items-center justify-center h-20 `}>
                    <input
                        id="search"
                        type='search'
                        placeholder={`Search`}
                        className='w-64 px-2 py-1 rounded-xl border-2 border-[#4a3623] no-focus-outline text-[#dcccb3] placeholder-[#dcccb3] bg-[#4a3623]'
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div
                        onClick={togelMobileSearch}
                        className="ml-6 cursor-pointer"
                    >X</div>
                </div>
            </div>

            <div
                onClick={togelMobileSearch}
                className="lg:hidden cursor-pointer z-50 hover:bg-gray-400 px-2 py-1 rounded-full absolute md:right-14 right-0 top-20"
            >
                <FontAwesomeIcon
                    icon={faMagnifyingGlass}
                />
            </div>

            <div className="product-grid">
                {firstEightProducts}
            </div>

            {isCustom &&
                <div
                    onClick={togelCustomDesin}
                    className="bg-[#0000004f] z-[999] backdrop-filter backdrop-blur-sm h-screen w-screen fixed top-0 right-0"
                >
                </div>
            }

            {isCustom &&
                <div
                    className='fixed top-0 right-1/2 translate-x-1/2 z-[9999]'
                >
                    <div
                        className='bg-white overflow-hidden w-96 h-[500px] relative mt-52 m-auto rounded-2xl shadow-sm shadow-slate-200'
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

                        <div className={`ease-out mt-16 mb-2 pl-5 pr-2 py-2 rounded-r-2xl bg-zinc-200 w-max
                                    ${isVisible
                                ? 'transition-all delay-0 translate-x-0'
                                : '-translate-x-24'
                            }
                                   `}>
                            السلام عليكم
                        </div>
                        <div className={`pl-5 pr-2 py-2 rounded-r-2xl bg-zinc-200 w-max
                                    ${isVisible
                                ? 'transition-all delay-500 translate-x-0'
                                : '-translate-x-52'
                            }
                                   `}>
                            الرجاء التواصل معنا في <br />
                            لطلب تصميم خاص
                            Instgram
                        </div>
                        <a
                            className="h-10 cursor-pointer flex items-center justify-between px-4 w-80 rounded-lg border-2 border-zinc-200 bg-transparent absolute bottom-4 right-8 "
                            href={window.innerWidth <= 768
                                ? 'instagram://user?username=drawlys_deco'
                                : `https://www.instagram.com/direct/t/17847607758008114`
                            }
                        >
                            <div>Message</div>
                            <FontAwesomeIcon icon={faPaperPlane} />
                        </a>

                    </div>
                </div>
            }

            {restOfTheProducts &&
                <div className="flex md:my-32 md:p-0 py-6 px-2 sm:my-28 mb-14 mt-24 items-center md:border-0 md:bg-transparent border-y bg-[#d7c9b2] border-gray-200 ">

                    <img
                        src={ledPainting.imageOn}
                        alt=""
                        width={120} height={120}
                        className='rounded-full shadow-2xl lg:w-64 lg:h-64 md:w-56 md:h-56 sm:w-40 sm:h-40 w-24 h-24'
                    />

                    <div
                        key="layer"
                        onClick={togelCustomDesin}
                        className="flex-grow flex cursor-pointer items-center justify-center shadow-lg md:mx-10 mx-2 md:h-32 sm:h-24 text-sm md:text-base bg-[#DCCCB3] border-2 border-[#4A3623] py-4 mb-20 md:mb-0 text-center text-[#4A3623] rounded-full"
                    >
                        Add a custom design
                    </div>

                    <img
                        src={ledPainting.imageOff}
                        alt=""
                        width={120} height={120}
                        className='rounded-full shadow-2xl lg:w-64 lg:h-64 md:w-56 md:h-56 sm:w-40 sm:h-40 w-24 h-24'
                    />

                </div>
            }

            <div className="product-grid">
                {restOfTheProducts}
            </div>
            {isFetchingNextPage && <div>Loading...</div>}
        </div>
    );
}

export default ProductsGrid;
