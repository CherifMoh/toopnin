'use client'

import { useDispatch, useSelector } from 'react-redux'
import { emptyCart } from "../redux/features/cart/cartSlice";
import '../../styles/pages/checkout.css'
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
// import { wilayat } from '../data/wilayat'
import Image from 'next/image';
import logo from '../../../public/assets/noBgLogo.png'
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import Spinner from '../../components/loadings/Spinner';
import ChechoutSkeleton from '../../components/loadings/ChechoutSkeleton';


async function fetchProducts(idArray) {
    try {
        const promises = idArray.map(async id => {
            const res = await axios.get(`/api/products/${id}`);
            return res.data[0];
        });
        return await Promise.all(promises);
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

async function fetchWilayt() {
    const res = await axios.get('https://tsl.ecotrack.dz/api/v1/get/wilayas', {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
        }
    });
    return res.data;
}
async function fetchFees() {
    const res = await axios.get('https://tsl.ecotrack.dz/api/v1/get/fees', {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
        }
    });
    return res.data;
}
async function fetchCommunes() {
    const res = await axios.get('https://tsl.ecotrack.dz/api/v1/get/communes', {
        headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
        }
    });
    return res.data;
}

function Checkout() {

    // Form Data States
    const [formData, setFormData] = useState({});

    // Form validation States
    const [isShippingSelected, setIsShippingSelected] = useState(true);
    const [isWilayaSelected, setIsWilayaSelected] = useState(true);
    const [isPhoneCorrect, setIsPhoneCorrect] = useState(true);

    const [isBeruAvailable, setIsBeruAvailable] = useState(true)

    const [slectedCommunes, setSlectedCommunes] = useState([]);

    const [isSubmiting, setIsSubmitting] = useState(false)

    // Form Change Functions
    const handleChange = (e) => {
        const value = e.target.value
        const name = e.target.name
        setFormData(preState => ({
            ...preState,
            [name]: value
        }))
    }


    let cart = useSelector((state) => state.cart.cart)

    const router = useRouter()

    const subTotalPriceState = useSelector((state) => state.totalPrice.totalPrice)

    const { data: products, isLoading, isError, error } = useQuery({
        queryKey: cart.map(cartItem => cartItem._id),
        queryFn: (queryKey) => fetchProducts(queryKey.queryKey)
    });

    const { data: communes, isLoading: communesLoding, isError: communesIsErr, error: communesErr } = useQuery({
        queryKey: ['communes'],
        queryFn: fetchCommunes
    });
    const { data: fees, isLoading: feesLoding, isError: feesIsErr, error: feesErr } = useQuery({
        queryKey: ['fees'],
        queryFn: fetchFees
    });
    const { data: wilayat, isLoading: wilayatLoding, isError: wilayatIsErr, error: wilayatErr } = useQuery({
        queryKey: ['wilayat'],
        queryFn: fetchWilayt
    });

   
    let shippingPrice = ''
    

    useEffect(() => {
        if (!wilayat || !fees) return

        wilayat.forEach(wilaya => {
            if (wilaya.wilaya_name === formData.wilaya) {

                const feesArray = Object.values(fees.livraison);
                const filteredFee = feesArray.filter(fee => fee.wilaya_id === wilaya.wilaya_id)[0];

                const adomicile = filteredFee.tarif;
                const stopdesk = filteredFee.tarif_stopdesk;

                if (adomicile === '') {
                    setIsBeruAvailable(false)
                    setFormData(pre => ({
                        ...pre,
                        shippingMethod: 'مكتب',
                        shippingPrice: stopdesk
                    }))
                    shippingPrice = stopdesk
                } else {
                    setIsBeruAvailable(true)
                }

                if (formData.wilaya && formData.shippingMethod) {
                    if (wilaya.wilaya_name === formData.wilaya) {
                        // setFormData(pre => ({
                        //     ...pre,
                        //     shippingMethod: 'بيت',
                        //     shippingPrice: adomicile
                        // }))
                        formData.shippingMethod === 'بيت'
                            ? setFormData(pre => {
                                shippingPrice = adomicile
                                return {
                                    ...pre,
                                    shippingMethod: 'بيت',
                                    shippingPrice: adomicile
                                }
                            })
                            
                            : setFormData(pre => {
                                shippingPrice = stopdesk
                                return {
                                    ...pre,
                                    shippingMethod: 'مكتب',
                                    shippingPrice: stopdesk
                                }
                            })
                    }
                }

            }
        })
    }, [formData.wilaya,formData.shippingMethod])

    const totalPrice = subTotalPriceState + shippingPrice


    useEffect(() => {
        setFormData(pre => ({
            ...pre,
            totalPrice,
            shippingPrice,
        }))

    }, [totalPrice])


    useEffect(() => {
        if (products) {
            let orders = []
            cart.forEach((cartItem, i) => {
                products.forEach(product => {
                    if (cartItem._id === product._id) {
                        orders =
                            [...orders,
                            {
                                _id: uuidv4(),
                                qnt: cartItem.qnt,
                                title: product.title,
                                imageOn: product.imageOn,
                                options: cart[i].options
                            }
                            ]
                    }
                })
            })


            setFormData(pre => ({
                ...pre,
                orders: orders
            }))
        }

    }, [products])

    useEffect(() => {
        if (!communes|| !wilayat||!formData.wilaya) return

        const wilayaCode = wilayat.find(wilaya => wilaya.wilaya_name === formData.wilaya).wilaya_id


        const communesArray = Object.values(communes);
        const filteredCommunes = communesArray.filter(commune => commune.wilaya_id === wilayaCode);

        setSlectedCommunes(filteredCommunes)

    }, [formData.wilaya,communes,wilayat])

    const dispatch = useDispatch();

    if (isLoading|| wilayatLoding|| communesLoding|| feesLoding) return <ChechoutSkeleton />
    if (isError) return <div>{error.message}</div>
    if (wilayatIsErr) return <div>Error: {wilayatErr.message}</div>;
    if (communesIsErr) return <div>Error: {communesErr.message}</div>;
    if (feesIsErr) return <div>Error: {feesErr.message}</div>;
    if (!products) return

    const productsElemtnt = cart.map(cartItem => {
        let product
        products.forEach(p => {
            if (p._id === cartItem._id) {
                product = p
            }
        })
        return (
            <div key={cartItem._id} className="flex text-left items-center mb-3 ">
                <div className="product-image-container min-w-16">
                    <span className="product-quntity">
                        {cartItem.qnt}
                    </span>
                    <img alt='' src={product.imageOn} width={64} height={64} className="product-image h-16 w-16" />
                </div>
                <div className="product-title text-sm">
                    {product.title}
                </div>
                <div className="product-price text-sm">
                    <span className="products-price">{cartItem.price * cartItem.qnt}
                    </span> Da</div>
            </div>
        )
    })


    const phonePattern = /^0\d{9}$/;


    async function handelSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true); // Set isSubmitting to true

        // Check phone pattern
        if (!phonePattern.test(formData.phoneNumber)) {
            setIsPhoneCorrect(false);
            setIsSubmitting(false); // Set isSubmitting to false
            return; // Exit the function
        }

        // Check if wilaya is selected
        if (!formData.wilaya) {
            setIsWilayaSelected(false);
            setIsSubmitting(false); // Set isSubmitting to false
            return; // Exit the function
        }

        // Check if shipping method is selected
        if (!formData.shippingMethod) {
            setIsShippingSelected(false);
            setIsSubmitting(false); // Set isSubmitting to false
            return; // Exit the function
        }

        try {
            // Make API call
            const res = await axios.post(`/api/orders`, formData);

            // Reset cart in localStorage
            dispatch(emptyCart)
            localStorage.removeItem('cart');
            localStorage.setItem('cart', JSON.stringify([]));

            // Refresh and navigate to thank you page
            router.refresh();
            router.push('/thankyou');
        } catch (error) {
            // Handle error if necessary
            console.error('Error submitting form:', error);
        }

    }
    const wilayatOptionsElement = wilayat.map(wilaya => (
        <option key={wilaya.wilaya_id} value={wilaya.wilaya_name}>
            {wilaya.wilaya_id} {wilaya.wilaya_name}
        </option>
    ))

    const communesOptionsElement = slectedCommunes.map(commune => (
        <option key={commune.nom} value={commune.nom}>
            {commune.nom}
        </option>
    ))

    const shippingStyle = {
        color: shippingPrice ? 'black' : ' rgb(220 38 38) ',
        fontWeight: shippingPrice ? 'normal' : ' 600 '
    }

    return (
        <div className='bg-white h-screen overflow-x-hidden lg:overflow-hidden'>
            <header className='flex items-center justify-center'>
                <a href="/" className="logo-container w-24 block">
                    <Image alt='' src={logo} width={80} height={80} className="logo" />
                </a>
            </header>
            <main>
                <section className="form-section bg-white h-screen">
                    <div className="form-container">
                        <h1 className='font-bold text-2xl mt-5 mb-5'>Delivery</h1>

                        <form onSubmit={handelSubmit}>
                            <input
                                onChange={handleChange}
                                required
                                className="name"
                                placeholder="Name"
                                name="name"
                                type="text"
                            />

                            {!isPhoneCorrect &&
                                <h1 className='flex justify-end text-red-600 font-semibold mb-1'>
                                    أدخل رقم هاتف صحيح
                                </h1>
                            }

                            <input
                                onChange={handleChange}
                                required
                                className="phone"
                                placeholder="Phone"
                                name="phoneNumber"
                                type="text"
                            />

                            {!isWilayaSelected &&
                                <h1 className='flex justify-end text-red-600 font-semibold mb-1'>
                                    أدخل الولاية
                                </h1>
                            }

                            <select
                                value={formData.wilaya}
                                onChange={handleChange}
                                required className="wilaya"
                                name="wilaya"
                            >
                                <option value="الولاية" hidden >الولاية</option>
                                {wilayatOptionsElement}
                            </select>

                            <select
                                value={formData.commune}
                                onChange={handleChange}
                                required className="wilaya"
                                name="commune"
                            >
                                <option hidden >commune</option>
                                {communesOptionsElement}
                            </select>

                            <input
                                onChange={handleChange}
                                required
                                className="baldia"
                                placeholder="Adresse"
                                name="adresse"
                                type="text"
                            />

                            {!isShippingSelected &&
                                <h1 className='flex justify-end text-red-600 font-semibold mb-1'>
                                    أدخل طريقة التوصيل
                                </h1>
                            }

                            {isBeruAvailable
                                ? <select
                                    value={formData.shippingMethod}
                                    onChange={handleChange}
                                    required className="shippingmethod"
                                    name="shippingMethod"
                                >
                                    <option value='طريقة التوصيل' hidden >طريقة التوصيل</option>
                                    <option value="بيت">بيت</option>
                                    <option value="مكتب">مكتب</option>
                                </select>
                                : <div className='my-5 text-xl font-semibold'>
                                    التوصيل الى البيت فقط
                                </div>
                            }

                            <button type="submit" className={`submit-button ${isSubmiting && 'h-16'} flex justify-center items-start`}>
                                {isSubmiting
                                    ? <Spinner color={'border-gray-500'} size={'h-10 w-10 '} />
                                    :
                                    ' أطلب الان'
                                }
                            </button>
                        </form>
                    </div>
                </section>
                <section className="order-details-section h-screen">
                    <div className="order-details-container p-3 md:p-11">
                        <div className="order-summary-title">Order Summary</div>

                        <div className="product-items-container">
                            {productsElemtnt}
                        </div>

                        <div className="order-price-cintainer">

                            <div className="nospasing subtotal prcie-c">
                                <div className="nospasing subtotal-text">Subtotal</div>
                                <div className="nospasing subtotal-price">
                                    <span className="nospasing js-subtotal-price" >{subTotalPriceState}</span> DA
                                </div>
                            </div>

                            <div className="nospasing shipping prcie-c">
                                <div className="nospasing shipping-text">Shipping</div>
                                <div className="nospasing shipping-price">
                                    <span style={shippingStyle} className="nospasing js-shipping-price">
                                        {shippingPrice ? shippingPrice + ' DA' :
                                            ' ادخل الولاية و طريقة التوصيل لتحديد السعر'
                                        }
                                    </span>

                                </div>
                            </div>

                            <div className="nospasing total prcie-c">
                                <div className="nospasing total-text">Total</div>
                                <div style={shippingStyle} className="nospasing total-price">
                                    {shippingPrice ? (shippingPrice + subTotalPriceState) + ' DA' :
                                        ' ادخل الولاية و طريقة التوصيل لتحديد السعر'
                                    }
                                </div>
                            </div>

                        </div>
                    </div>

                </section>
            </main>
        </div>
    )
}

export default Checkout