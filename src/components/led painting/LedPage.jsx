"use client"

import '../../styles/pages/ledProductPage.css'
import '../../styles/pages/index.css'

import { useSelector, useDispatch } from 'react-redux'
import { addProduct, removeProduct, updatedQuntity } from '../../app/redux/features/cart/cartSlice'
import { showCartToggle } from "../../app/redux/features/showCart/showCartSlice";
import { Fragment, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ruler from '../../../public/assets/ruler.svg'
import { useQuery } from "@tanstack/react-query";
import arrowDown from '../../../public/assets/arrow-down.svg'
import Material from '../../../public/assets/Material.svg'
import ProductPSkelaton from "../loadings/ProductPSkelaton";
import axios from "axios";


const fetchLedPainting = async () => {
    const res = await axios.get(`/api/products/LedPainting`);
    return res.data[0];
}

function ProductPage({ mproduct }) {

    const { data: ledPainting, isLoading, isError, error } = useQuery({
        queryKey: ['led Painting'],
        queryFn: () => fetchLedPainting()
    });

    const [qnt, setQnt] = useState(1)

    const [isDropdowns, setIsDropdowns] = useState([])

    const [selectedOption, setSelectedOption] = useState()

    const [isSelectedOption, setIsSelectedOption] = useState(true)

    const isCartShown = useSelector((state) => state.isCartShown.isCartShown)

    const cart = useSelector((state) => state.cart.cart)

    const dispatch = useDispatch();

    const handelCartToggle = () => {
        dispatch(showCartToggle());
    }

    const [mainImage, setMainImage] = useState(mproduct.imageOn);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isImageChanging, setIsImageChanging] = useState(false);

    const [sales, setSales] = useState('');

    const galleryImages = mproduct.gallery;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentIndex(prevIndex =>
                prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
            );
        }, 3000); // Change image every 1 second

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [galleryImages.length]);

    useEffect(() => {
        setIsImageChanging(true);
        const timeoutId = setTimeout(() => {
            setIsImageChanging(false);
            setMainImage(galleryImages[currentIndex]);
        }, 400); // Time for the fade-out effect

        return () => clearTimeout(timeoutId);

    }, [currentIndex, galleryImages]);

    useEffect(() => {
        checkIfSale(qnt)
    }, [qnt]);

    if (isLoading) return <div>{<ProductPSkelaton />}</div>
    if (isError) return <div>{error.message}</div>

    if (!ledPainting) return



    const handleAddToCart = (productId, qnt, price, sales) => {
        if (!selectedOption) return setIsSelectedOption(false)

        const newOptions = ledPainting.options.map(option => {
            if (option.title === selectedOption.title) {
                return { ...option, selected: true }
            }
            return option
        })

        handelCartToggle()

        dispatch(addProduct({
            _id: productId,
            qnt: qnt,
            price: price,
            options: newOptions,
            sales: sales,
        }));
        console.log(cart)
    };

    localStorage.setItem('cart', JSON.stringify(cart))


    function checkIfSale(qnt) {

        let isSales = false;


        if (qnt > ledPainting?.sales.length + 1) {
            const sale = ledPainting.sales[ledPainting.sales.length - 1];
            setSales(sale.percen)
            isSales = true;
        } else {
            for (let i = 0; i < ledPainting?.sales.length; i++) {
                const sale = ledPainting.sales[i];

                if (Number(sale.qnt) === qnt) {
                    isSales = true;
                    setSales(sale.percen)
                    break; // Exit the loop since the condition is met
                }
            }
        }

        if (!isSales) {
            setSales('')
        }
        return isSales;

    }

    const galleryElement = mproduct.gallery.map((image, i) => {
        return (
            <img
                key={image}
                alt=''
                src={image}
                width={20} height={20}
                className="gallery-image cursor-pointer"
                onClick={() => setMainImage(image)}
            />
        )
    })

    const Plines = ledPainting.description.split('\n');

    const PDescriptionElement = Plines.map((line, i) => {
        return (
            <Fragment key={line + i} >
                <p 
                    className='font-semibold xl:max-w-[500px] lg:max-w-[400px] md:max-w-[250px] sm:max-w-[500px] max-w-[300px]  break-words'
                    dir="rtl"
                >
                    {line}
                </p>
                {/* <br /> */}
            </Fragment>
        )
    })

    const Dlines = mproduct.description.split('\n');

    const DDescriptionElement = Dlines.map((line, i) => {
        return (
            <Fragment key={line + i} >
                <p 
                    className='font-semibold xl:max-w-[500px] lg:max-w-[400px] md:max-w-[250px] sm:max-w-[500px] max-w-[300px]  break-words'
                    dir="rtl"
                >
                    {line}
                </p>
            </Fragment>
        )
    })

    const priceElement = ledPainting.options?.map((option, i) => {
        return (
            <div
                className="price-after-sale "
                key={i}
            >
                {option.price}
                {i !== ledPainting.options.length - 1
                    && <span className=' w-4 h-2 inline-block border-t-[2px] ml-2 border-black text-center'></span>
                }
            </div>
        )
    })

    const optionsElement = ledPainting.options?.map(option => {

        const buttonStyle = {
            boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset'
        }

        return (
            <button
                className={`flex transition-all text-white justify-center items-center gap-4 px-4 py-2 rounded-full ${selectedOption?.title === option.title ? 'bg-[#9f865d] ' : 'bg-[#bda780]'}`}
                style={buttonStyle}
                key={option.title}
                onClick={() => { setSelectedOption(option); setIsSelectedOption(true) }}
            >
                <img
                    src={option.image}
                    alt=''
                    width={100} height={100}
                    className='w-12'
                />
                <div className='flex flex-col justify-center text-white items-center'>
                    <span className='price-after-sale text-white text-sm'>{option.title}</span>
                    <span className='price-after-sale text-white text-sm'>{option.price} DA</span>
                </div>
            </button>
        )
    })

    const dropDownsElement = ledPainting.dropDowns?.map((dropdown, i) => {

        const Dlines = dropdown?.body?.split('\n');

        const dropdownBody = Dlines.map((line, i) => {
            return (
                <Fragment key={line + i} >
                    <p 
                        className='font-semibold xl:max-w-[500px] lg:max-w-[400px] md:max-w-[250px] sm:max-w-[500px] max-w-[300px]  break-words'
                        dir="rtl"
                    >
                        {line}
                    </p>
                </Fragment>
            )
        })

        return (
            <div className="drop-down" key={dropdown.title}>
                <div 
                    className={`drop-header ${i !== 0 && 'drop-header2'} flex justify-between items-center gap-2 cursor-pointer`} 
                    onClick={() => setIsDropdowns(pre =>{
                        if(pre.includes(dropdown.title)){
                            return pre.filter(item => item !== dropdown.title)
                        }
                        return [...pre, dropdown.title]
                    })}
                >
                    {/* <img 
                        className="drop-icon" 
                        src={ruler} alt="" 
                        width={5} height={5}
                    /> */}
                    <h2 className="drop-title pl-6">
                        {dropdown.title}
                    </h2>
                    <Image
                        src={arrowDown} width={5} height={5} alt=""
                        className={`drop-arrow transition-all duration-100 
                                    ${isDropdowns.includes(dropdown.title) && 'rotate-180'}
                                  `}
                    />
                </div>
                <div 
                    className={`dimensions-body transition-all duration-500 
                                ${!isDropdowns.includes(dropdown.title) && 'hidden'}
                              `}
                >
                    <p
                        className="drop-dimensions-title font-semibold text-xl"
                        dir="rtl"
                    >
                        {dropdown.header}
                    </p>
                    <p className="dimensions">
                        {dropdownBody}
                    </p>
                </div>
            </div>
        )
    })

    return (
        <section className="selected-prodect-container overflow-hidden">
            <section className="product-gallery">
                <div className={`main-image-container transition-all duration-1000 ${isImageChanging ? ' opacity-50' : ' opacity-100'}`}>
                    <img alt='' src={mainImage} width={20} height={20} className="main-image main-image-on" />
                </div>
                <div className="gallery-container justify-center items-center flex gap-2 overflow-hidden">
                    {galleryElement}
                </div>
            </section>
            <section className="product-info">
                <div className="product-title capitalize spawn-anime">{mproduct.title}</div>
                <div className="spawn-anime flex items-center">
                    {DDescriptionElement}
                </div>
                <div className="price-container flex gap-1 spawn-anime">
                    {sales && priceElement &&
                        <>
                            <span className="price-befor-sale ">{selectedOption.price * qnt} DA</span>
                            <span className="price-after-sale ">{(selectedOption.price - (selectedOption.price * sales) / 100) * qnt} DA</span>
                        </>
                    }

                    {!sales ? priceElement
                        ? selectedOption ? <span className='price-after-sale'>{selectedOption.price} DA</span> : <div className='flex'>{priceElement} DA</div>
                        : <span className="price-after-sale ">{ledPainting.price}  DA</span>
                        : ''}

                    {sales && priceElement &&
                        <span className="sale-mark">Sale {sales} %</span>
                    }
                </div>
                <p className="spawn-anime mt-4 mb-4">Options</p>

                {!isSelectedOption &&
                    <div className='text-red-500 text-lg text-end pr-4 font-semibold'>
                        اختر احد الخيارات *
                    </div>
                }

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 mb-6 items-center justify-evenly gap-2 spawn-anime'>
                    {optionsElement}
                </div>
                <p className="spawn-anime mt-4 mb-4">Quantity</p>
                <div className="quantity-container spawn-anime flex">
                    <button
                        className="minus-quantity-button flex items-start justify-center"
                        onClick={() => {
                            if (optionsElement) {
                                if (!selectedOption) {
                                    return setIsSelectedOption(false)
                                } else if (qnt > 1) {
                                    setQnt(pre => pre - 1)
                                }
                            } else if (qnt > 1) {
                                setQnt(pre => pre - 1)
                            }
                        }}
                    >
                        _
                    </button>
                    <div
                        className="quantity-input text-center flex items-center justify-center"
                    >{qnt}</div>
                    <button
                        className="plus-quantity-button pb-1"
                        onClick={() => {
                            if (optionsElement) {
                                if (!selectedOption) {
                                    return setIsSelectedOption(false)
                                } else {
                                    setQnt(pre => pre + 1)
                                }
                            } else {
                                setQnt(pre => pre + 1)
                            }
                        }}
                    >
                        +
                    </button>
                </div>
                <button
                    className="Add-to-cart bg-[#bda780] spawn-anime text-[#1a2332]"
                    data-product-id={mproduct._id}
                    onClick={() => handleAddToCart(mproduct._id, qnt, ledPainting.price, ledPainting.sales)}
                >
                    Add to cart
                </button>
                {optionsElement.length > 0 && selectedOption ?
                    <Link
                        href="/checkout"
                    >
                        <button
                            className="Add-to-cart text-[#DCCCB3] bg-[#4a3623]"
                            data-product-id={mproduct._id}
                            onClick={() => handleAddToCart(mproduct._id, qnt, ledPainting.price, ledPainting.sales)}
                        >
                            Buy now
                        </button>
                    </Link>
                    :
                    <button
                        className="Add-to-cart spawn-anime text-[#DCCCB3] bg-[#4a3623]"
                        data-product-id={mproduct._id}
                        onClick={() => handleAddToCart(mproduct._id, qnt, ledPainting.price, ledPainting.sales)}
                    >
                        Buy now
                    </button>
                }

                <div className="discription-container spawn-anime">
                    <div className="discription mt-4 mb-4 ">
                        {PDescriptionElement}
                    </div>
                    <div className="drop-container">
                        {dropDownsElement}


                        {/* <div className="drop-down">
                            <div className="drop-header js-material drop-header2 cursor-pointer" onClick={() => setIsMaterial(pre => !pre)}>
                                <img
                                    className="drop-icon"
                                    src={Material}
                                    width={10}
                                    height={10}
                                    alt=""
                                />
                                <h2 className="drop-title">Material</h2>
                                <img
                                    className={`drop-arrow js-material-arrow transition-all duration-100 ${isMaterial && 'rotate-180'}`}
                                    src={arrowDown} alt=""
                                    height={5} width={5}
                                />
                            </div>
                            <div className={`material-body transition-all duration-500 ${!isMaterial && 'hidden'}`}>
                                <p className="material" >Frame: Exquisite wood grain frame</p>
                            </div>
                        </div> */}
                    </div>
                </div>
            </section>
        </section>
    )
}

export default ProductPage