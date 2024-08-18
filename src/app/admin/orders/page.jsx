"use client"

import axios from "axios";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from "react";
import Image from "next/image";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns'
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faPen, faPlus, faX, faCheck, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { deleteOrder, getOrder } from '../../actions/order'
import { editMinusProduct } from '../../actions/storage'
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'
import {AmiriFont} from '../../data/AmiriFont'

import downArrow from '../../../../public/assets/arrow-down.svg';
import orangeBg from '../../../../public/assets/orange bg.png';
import redBg from '../../../../public/assets/red bg.png';
import greenBg from '../../../../public/assets/green bg.png';
import lightGreenBg from '../../../../public/assets/light green bg.png';
import yellowBg from '../../../../public/assets/yellow bg.png';
import darkBlueBg from '../../../../public/assets/drak blue bg.png';
import lightBlueBg from '../../../../public/assets/light blue bg.png';
import transparent from '../../../../public/assets/transparent.png';
import '../../../styles/pages/orders.css'

import returns from '../../../../public/assets/tracking Icon/returns.png';

import { PDFDocument } from 'pdf-lib';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import Spinner from '../../../components/loadings/Spinner'
import { useSelector } from "react-redux";
// import { sandMessage } from "../../actions/instagram";


async function fetchOrders(date) {

    const res = await axios.get('/api/orders', {
        params: { date: date }
    });
    return res.data;
}

async function fetchDesigns() {
    const res = await axios.get('/api/products/ledDesigns/images');
    return res.data;
}
async function fetchProducts() {
    const res = await axios.get('/api/products');
    return res.data;
}

function Orders() {

    typeof document !== 'undefined' && document.body.classList.add('bg-white')

    const [deleting, setDeleting] = useState([])

    const [dateFilter, setDateFilter] = useState('today')

    const { data: Orders, isLoading, isError, error } = useQuery({
        queryKey: ['orders',dateFilter],
        queryFn: ({queryKey})=>fetchOrders(queryKey[1]),
        // enabled: !!dateFilter,
    });


    const { data: Designs, isLoading: designsLoding, isError: designsIsError, error: designErr } = useQuery({
        queryKey: ['AdminledDesigne'],
        queryFn: fetchDesigns
    });

    const { data: Products, isLoading: ProductsLoding, isError: ProductsIsError, error: ProductsErr } = useQuery({
        queryKey: ['Admin All Products'],
        queryFn: fetchProducts
    });

    const [editedOrder, setEditedOrder] = useState({})

    const [editedOrderId, setEditedOrderId] = useState('')

    const [selectedDate, setSelectedDate] = useState(null);

    const [selectedImage, setSelectedImage] = useState({ _id: '', image: '' });

    const [search, setSearch] = useState('')

    const [orderAction, setOrderAction] = useState('')
    const [isOrderAction, setIsOrderAction] = useState(false)

    const [isdesigns, setIsdesigns] = useState({ _id: '', state: false })
    const [isproducts, setIsproducts] = useState({ _id: '', state: false })

    const [isProductDeleted, setIsProductDeleted] = useState([])

    const [newOrders, setNewOrders] = useState({})
    
    const [trackingFilter, setTrackingFilter] = useState('unconfirmed')
    
    const [isAddingProduct, setIsAddingProduct] = useState([])
    const [addedOrder, setAddedOrder] = useState({})
    const [isAddedProducts, setIsAddedProducts] = useState([])
    const [isAddedDesigns, setIsAddedDesigns] = useState([])
    const [selectqnt, setSelectqnt] = useState(1)
    
    const [isGallery, setIsGallery] = useState([])

    const [scheduleQnt, setScheduleQnt] = useState()

    const [isSchedule, setIsSchedule] = useState(false)

    const [errorNotifiction, setErrorNotifiction] = useState('')
    const [successNotifiction, setSuccessNotifiction] = useState('')

    const [saving, setSaving] = useState([])

    const [lablesLoading, setLablesLoading] = useState(false)

    const [isSending, setIsSending] = useState(false)
    const [instaMessage, setInstaMessage] = useState('')
    
    const [selectedOrders, setSelectedOrders] = useState([])
    const [isCrafting, setIsCrafting] = useState(false)
    const [isLabels, setIsLabels] = useState(false)

    const [isCreateAccess, setIsCreateAccess] = useState(false)
    const [isUpdateAccess, setIsUpdateAccess] = useState(false)
    const [isDeleteAccess, setIsDeleteAccess] = useState(false)
    
    const [ordersUpdted, setOrdersUpdted] = useState(false)
    
    const [isSearching, setIsSearching] = useState(false)
    const [searchingMethode, setSearchingMethode] = useState('phoneNumber')
    const [serachingValue, setSerachingValue] = useState()
    const [reaserchedOrders, setReaserchedOrders] = useState([])

    const router = useRouter()

    const queryClient = useQueryClient()

    const accessibilities = useSelector((state) => state.accessibilities.accessibilities)

    const playSuccessSound = () => {
        const audio = new Audio('/assets/sounds/SuccessSound.mp3');
        audio.play().catch(error => {
            console.log('Error playing the error sound:', error);
        });
    };

    const playErrorSound = () => {
        const audio = new Audio('/assets/sounds/ErrorSound.mp3');
        audio.play().catch(error => {
            console.log('Error playing the error sound:', error);
        });
    };

    useEffect(()=>{
        if(accessibilities.length === 0)return
        const access = accessibilities.find(item=>item.name === 'orders')
        if(!access || access.accessibilities.length === 0){
           return router.push('/admin')
        }
        setIsDeleteAccess(access.accessibilities.includes('delete'))
        setIsUpdateAccess(access.accessibilities.includes('update'))
        setIsCreateAccess(access.accessibilities.includes('create'))
    },[accessibilities])


    useEffect(() => {
        const inputs = document.querySelectorAll('.dynamic-width');
        inputs.forEach(input => {
            if (input.name !== 'schedule') input.style.width = `${(input.value.length + 2) * 9}px`;
        });
    }, [editedOrderId]);

    useEffect(() => {
        setNewOrders(editedOrder.orders)
    }, [editedOrder]);


    useEffect(() => {
        let newSchedule = 0
        Orders?.forEach(order => {
            const currentDate = format(new Date(), 'yyyy-MM-dd');

            // Check if the saved date is the same as today
            const isSameAsToday = order.schedule === currentDate;
            if (isSameAsToday) newSchedule++
        })
        setScheduleQnt(newSchedule)
    }, [editedOrder, Orders]);

    useEffect(() => {

        if(successNotifiction!=='')playSuccessSound()

        setTimeout(() => {
            setSuccessNotifiction('')
        }, 3000);

    }, [successNotifiction]);

    useEffect(() => {

        if(errorNotifiction!=='')playErrorSound()

        setTimeout(() => {
           setErrorNotifiction('')
        }, 3000);

    }, [errorNotifiction]);

    

    useEffect(() => {
        let isMounted = true; // Flag to track component mount status

        if (!Orders || ordersUpdted) return;

        console.log('Orders Updating ...');

        setOrdersUpdted(true);

        const fetchAndUpdateOrders = async () => {
            try {
                // const allPages = await fetchAllPages();
                await Promise.all(
                    Orders.map(async (order) => {
                        const currentDate = format(new Date(), 'yyyy-MM-dd');
    
                        if (order.tracking === 'livred' || order.tracking === 'returned') return;
                        
                        let newTracking = await getOrderStatus(order) 
                   
                        // counter++;
                        if (newTracking === order.tracking) return;
    
                        const newOrder = { ...order, tracking: newTracking };
    
                        
                        const respones = await axios.put(`/api/orders/${order._id}`, newOrder, {
                            headers: { 'Content-Type': 'application/json' }
                        });

                        const updtedOrder = respones.data;

                        // console.log(typeof updtedOrder);

                        console.log('Orders Updated');
                        
                    })
                );
                queryClient.invalidateQueries(['orders', dateFilter]);
            } catch (err) {   
                setOrdersUpdted(false);
                console.log(err); 
            }
        };
        getOrderStatus()

        // fetchAndUpdateOrders();

        return () => {
            // Cleanup function
            isMounted = false;
        };
    }, [Orders, ordersUpdted, dateFilter, queryClient]);
    
    // useEffect(() => {
    //     if(!Orders) return
    //     fetchAllOrders(Orders)
    // }, [Orders]);
    
    




    

    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching Orders: {error.message}</div>;

    if (designsLoding) return <div>Loading...</div>;
    if (designsIsError) return <div>Error fetching Designs: {designErr.message}</div>;

    if (ProductsLoding) return <div>Loading...</div>;
    if (ProductsIsError) return <div>Error fetching Products: {ProductsErr.message}</div>;
    
    async function fetchOrderStatus(tracking) {
        try{
            const res = await axios.post('https://procolis.com/api_v1/token', 
                {
                    Colis: [
                        { "Tracking": "ZRFPH358A" }
                    ]
                }, 
                {
                    headers: {
                        key: process.env.NEXT_PUBLIC_ZR_API_KEY,
                        token: process.env.NEXT_PUBLIC_ZR_API_TOKEN
                    }
                }
            );
            return res.data
        }catch(err){
            console.log(err.message)
            return null
        }
    }

    
    async function getOrderStatus(order) {            
       
        const res = await fetchOrderStatus('ZRFPH358A')
        console.log(res)
        // const ZrStatus = res.activity[lastIndex].status;
        // const newTracking = newTrackingFromActivity(order, ZrStatus);            
       
        // return newTracking

    }

    function newTrackingFromActivity(order, ZrStatus) {
        let newTracking = ''
        if (!order.inDelivery && order.state !== 'مؤكدة') {
            newTracking = '';
        } else if (!order.inDelivery) {
            newTracking = 'Prêt à expédier';
        } else if (ZrStatus === 'accepted_by_carrier') {
            newTracking = 'Vers Wilaya';
        } else if (ZrStatus === 'order_information_received_by_carrier') {
            newTracking = 'Vers Station';
        } else if (ZrStatus === 'attempt_delivery' || ZrStatus === 'dispatched_to_driver') {
            newTracking = 'En livraison';
        } else if (ZrStatus === 'livred') {
            newTracking = ZrStatus;
        // } else if (ZrStatus === 'notification_on_order') {
        //     newTracking = 'En preparation';
        } else if (ZrStatus === 'notification_on_order') {
            newTracking = 'Suspendus';
        } else if (ZrStatus === 'returned') {
            newTracking = 'returned';
        }
        return newTracking
    }
    
    

    
    function orderIdToggel(id) {
        if (editedOrderId === id) {
            setEditedOrderId('')
        } else {
            setEditedOrderId(id)
        }
    }


    function handleChange(e) {
        const input = e.target

        const name = input.name;
        const value = input.value;
        

        if (name !== 'schedule') input.style.width = `${(input.value.length + 2) * 9}px`;
        setEditedOrder(prev => ({
            ...prev,
            [name]: value
        }));
    }
    function handleProductChange(newOrder, id) {

        setEditedOrder(prev => {
            const newOrders = prev.orders.map(order => {
                if (order._id === id) {
                    newOrder = {
                        _id: id,
                        qnt: order.qnt,
                        imageOn: newOrder.imageOn,
                        options: newOrder.options,
                    }
                    return newOrder
                }
                return order
            })
            return { ...prev, orders: newOrders }
        });
    }

    function handleQntChange(e, i) {
        const input = e.target


        const name = input.name;
        const value = input.value;

        input.style.width = `${(input.value.length + 2) * 9}px`;

        setNewOrders(pre => {
            pre[i] = { ...pre[i], [name]: value }
            return pre
        });
    }

    function handleOptChange(e, i) {
        const input = e.target
        const name = input.name;
        const value = input.value;

        input.style.width = `${(input.value.length + 4) * 10}px`;


        setNewOrders(pre => {
            let newOption = []
            pre[i].options.forEach(option => {
                if (option.title === value) {
                    newOption = [...newOption, { ...option, selected: true }]
                }
                if (option.selected) {
                    newOption = [...newOption, { ...option, selected: false }]
                }
                return option
            })
            pre[i] = { ...pre[i], options: newOption }
            return newOption = [...newOption, pre]
        });
    }

    function handleDateChange(date) {

        setSelectedDate(date);
        const formattedDate = format(date, 'yyyy-MM-dd');
        setEditedOrder(prev => ({
            ...prev,
            schedule: formattedDate,
            tracking: 'scheduled'

        }));
    }

    async function handleDelete(id) {
        setDeleting(pre => ([...pre, {
            id: id,
            state: true
        }]))
        setEditedOrderId('')
        await deleteOrder(id)
        router.refresh()
        router.push('/admin/orders')
        queryClient.invalidateQueries('AdminledDesigne');
    }

    let longesOrder = []
    Orders.forEach(order => {
        if (order.orders.length > longesOrder.length) {
            longesOrder = order.orders
        }

    })

    let ordersQnts =[]
    editedOrder?.orders?.forEach(order => {
        const i = ordersQnts.findIndex(item=>item.title === order.title)
        if(i > -1){
            ordersQnts[i].qnt = Number(ordersQnts[i].qnt) + Number(order.qnt)
        }else{
            ordersQnts.push({title: order.title, qnt: order.qnt})
        }
    })

    async function addToTsl(order) {

        if(!order.name||!order.phoneNumber||!order.adresse||!order.commune){
            return setErrorNotifiction("couldn't set the order in TSL")
        }
        
        const wilayatresponse = await axios.get('https://tsl.ecotrack.dz/api/v1/get/wilayas', {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
            }
        });
        const wilayat = wilayatresponse.data; // Get the data from the response

        const wilayaCode =wilayat.find(wilaya=>wilaya.wilaya_name === order.wilaya).wilaya_id

        const communesresponse = await axios.get('https://tsl.ecotrack.dz/api/v1/get/communes', {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
            }
        });
        const communes = communesresponse.data; // Get the data from the response
        
        const communesArray = Object.values(communes);
        const filteredCommunes = communesArray.filter(commune => commune.wilaya_id === wilayaCode);
       
        let products =[]

        order.orders.forEach(order=>{
            const i =products.findIndex(product=>product === order.title)
            if(i === -1){
                products.push(order.title)
            }
        })


        const TslOrder ={
            nom_client:order.name,
            telephone:order.phoneNumber,
            adresse:order.adresse,
            commune:order.commune,
            produit:products[0],
            code_wilaya: wilayaCode,
            fragile:1,
            remarque:order.deliveryNote,
            montant:order.totalPrice,
            stop_desk:order.shippingMethod === 'مكتب' ? 1 : 0,
            type:1,
        }

     

        try {
            const res = await axios.post('https://tsl.ecotrack.dz/api/v1/create/order', TslOrder, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`,
                    'Content-Type': 'application/json', // Ensure correct content type
                }
            });

            if(res.data.success){
                setSuccessNotifiction("the order is set in TSL")
                return {tracking:res.data.tracking}
                
            }
        } catch (error) {
            setErrorNotifiction("couldn't set the order in TSL")
            setEditedOrder(pre=>{
                return {...pre, state: 'غير مؤكدة'}
            })
            console.error('Error:', error.response?.data || error.message);
        }
    }

    async function validateToTsl(tracking,ask_collection) {
       
        try {
            const res = await axios.post(
                'https://tsl.ecotrack.dz/api/v1/valid/order',
                {
                    tracking: tracking,
                    ask_collection: ask_collection
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if(res.data.success){
                setSuccessNotifiction(res.data.message);
                return {tracking:res.data.tracking};
            }
        } catch (error) {
            setErrorNotifiction("couldn't validate the order in TSL");
            console.error('Error:', error.response?.data || error.message);
        }
        
    }
    
    async function updateToTsl(order) {

        const wilayatresponse = await axios.get('https://tsl.ecotrack.dz/api/v1/get/wilayas', {
            headers: {
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
            }
        });
        const wilayat = wilayatresponse.data; // Get the data from the response

        const wilayaCode =wilayat.find(wilaya=>wilaya.wilaya_name === order.wilaya).wilaya_id


        let products =[]

        order.orders.forEach(order=>{
            const i =products.findIndex(product=>product === order.title)
            if(i === -1){
                products.push(order.title)
            }
        })


        const TslOrder ={
            tracking: order.DLVTracking,
            nom_client:order.name,
            telephone:order.phoneNumber,
            adresse:order.adresse,
            produit:products[0],
            remarque:order.deliveryNote,
            montant:order.totalPrice,
        }

   
        try {
            const res = await axios.post(
                'https://tsl.ecotrack.dz/api/v1/update/order',TslOrder,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if(res.data.success){
                setSuccessNotifiction(res.data.message);
                return {tracking:res.data.tracking};
            }
        } catch (error) {
            setErrorNotifiction("couldn't update the order in TSL");
            console.log(error)
            console.error('Error:', error.response?.data || error.message);
        }
        
    }

    async function validateMultibelToTSL(orders,ask_collection){
        orders.forEach(async(order) => {
            
        
            let res = await validateToTsl(order.DLVTracking,ask_collection)
         
            
            
            const newOrder = {
                ...order,
                inDelivery: true,
            };
            const response = await axios.put(`/api/orders/${order._id}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
            queryClient.invalidateQueries(`orders,${dateFilter}`);
        })
    }

    async function handleUpdatingOrder(id) {
        // setEditedOrder(pre => ({ ...pre, orders: newOrders }))
        setSaving(pre => ([...pre, id]))
        const oldOrder = Orders.find(order => order._id === id)

        if(oldOrder.tracking !== 'delivered' && editedOrder.tracking === 'delivered'){
            ordersQnts.forEach(order=>{
                editMinusProduct(order.title,order.qnt)
            })
        }

        let tracking =''

        if(oldOrder.state !== 'مؤكدة' && editedOrder.state  === 'مؤكدة'){
            let res = await addToTsl(editedOrder)
            tracking = res?.tracking
        }
        
        const newOrder = {
            ...editedOrder,
            ...(tracking && { DLVTracking: tracking })
        };
        
        if(editedOrder.state  === 'مؤكدة' && editedOrder.DLVTracking){
            let res= await updateToTsl(editedOrder)
        }

        if(oldOrder.inDelivery !== true && editedOrder.inDelivery  === true && editedOrder.state  === 'مؤكدة'){
            let res= await validateToTsl(editedOrder.DLVTracking,0)
        }

        const res = await axios.put(`/api/orders/${editedOrderId}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
        // console.log(res.data)
        queryClient.invalidateQueries(`orders,${dateFilter}`);
        setIsProductDeleted([])
        setSelectedDate(null)
        setSaving(pre => {
            const nweSaving = pre.filter(SId => SId !== id)
            return nweSaving
        })

    }

    async function confirmMultibel(orders) {
        orders.forEach(async(order) => {
            
            let tracking =''
        
            let res = await addToTsl(order)
            tracking = res?.tracking
            
            
            const newOrder = {
                ...order,
                state: 'مؤكدة',
                ...(tracking && { DLVTracking: tracking })

            };
            const response = await axios.put(`/api/orders/${order._id}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
            queryClient.invalidateQueries(`orders,${dateFilter}`);
        })
    }

    function isWithinPastWeek(dateString) {
        // Parse the input date
        const inputDate = new Date(dateString);

        // Get the current date and time
        const currentDate = new Date();

        // Calculate the date one week ago from today
        const oneWeekAgoDate = new Date();
        oneWeekAgoDate.setDate(currentDate.getDate() - 8);

        // Check if the input date is within the past week
        return inputDate >= oneWeekAgoDate && inputDate <= currentDate;
    }
    function isDateInPastMonth(dateStr) {
        // Parse the input date
        const inputDate = new Date(dateStr);

        // Get the current date and time
        const currentDate = new Date();

        // Calculate the date one month ago from today
        const oneMonthAgoDate = new Date();
        oneMonthAgoDate.setMonth(currentDate.getMonth() - 1);

        // Check if the input date is within the past month
        return inputDate >= oneMonthAgoDate && inputDate <= currentDate;
    }

    function handleDateFilterChange(e) {
        const value = e.target.value

        

        if (value === 'today') setDateFilter('today')
        if (value === 'yesterday') setDateFilter('yesterday')
        if (value === 'this Week') setDateFilter('this Week')
        if (value === 'this Month') setDateFilter('this Month')
        if (value === 'maximum') setDateFilter('maximum')

        setOrdersUpdted(false)

    }

    function filterOrders(order, currentDate) {
        const createdDate = order.updatedAt.slice(0, 10).toLowerCase();
        const searchLower = search.toLowerCase();

        const currentDateObj = new Date(currentDate);
    
        // Create a new Date object for yesterday's date
        const cDate = new Date(currentDateObj);
        cDate.setDate(cDate.getDate() - 1);
        const yesterdayDate = cDate.toISOString().slice(0, 10);


        const isMatchingSearch = (
            order.name.toLowerCase().includes(searchLower) ||
            order.wilaya.toLowerCase().includes(searchLower) ||
            order.phoneNumber.includes(searchLower) ||
            order.DLVTracking?.toLowerCase().includes(searchLower) ||
            order.adresse.toLowerCase().includes(searchLower)
        );

        let isMatchingTraking
        

        if(trackingFilter ==='Scheduled'){
            isMatchingTraking = order.schedule === currentDate;

        }else if(trackingFilter ==='unconfirmed'){
            isMatchingTraking = order.state !== 'مؤكدة'
        }else{
            isMatchingTraking = order.tracking===trackingFilter
        }

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

    async function deleteOrderProduct(id) {
        setNewOrders(prev => {
            const newesOrders = prev.filter(order => order._id !== id)
            setEditedOrder(pre => {
                return { ...pre, orders: newesOrders }
            })
            return newesOrders

        })
        setIsProductDeleted(pre => [...pre, id])
    }

    function toggleIsAding(id) {
        setIsAddingProduct(pre => {
            if (pre.includes(id)) {
                return pre.filter(productId => productId !== id)
            }
            return [...pre, id]
        })
    }

    function checkFileSize(file) {
        if (file) {
            const fileSize = file.size; // in bytes
            const maxSize = 1000000; // 500KB
            if (fileSize > maxSize) {
                alert('File size exceeds the limit. Please select a smaller file.');
                return false;
            }
            return true;
        }
    }

    async function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (err) => {
                reject(err);
            };
        });
    }

    async function handleFileUpload(event) {
        const fileInput = event.target;
        const file = fileInput.files[0];

        if (!file) {
            e.target.files[0] = []
        }
        const formData = new FormData();
        formData.append('image', file);

        fetch('https://toopnin.com:8444/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            setAddedOrder(pre => ({ ...pre, image: data }));
        })
        .catch(error => {
            console.error('Error:', error);
            // document.getElementById('message').innerHTML = `<p>Upload failed. Please try again.</p>`;
        });
    }

    const designOptionsElent = Designs.map(design => {
        if (design.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
            return (
                <div
                    key={design._id}
                    className='border-gray-500 z-50 border-b-2 p-4 bg-white'
                >
                    <img
                        src={design.imageOn}
                        alt=''
                        // width={128} height={128}
                        onClick={() => {
                            setSelectedImage({
                                _id: product._id,
                                image: design.imageOn
                            })
                            setIsproducts({ _id: '', state: false })
                            setIsdesigns({ _id: '', state: false })
                        }}
                    />
                </div>
            )
        }

    })

    const productsOptionsElent = Products.map(products => {
        if (products.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
            return (
                <div
                    key={products._id}
                    className='flex p-4 z-50 border-gray-500 border-b-2 w-full items-center justify-between bg-white'
                    onClick={(e) => {
                        handleProductChange(products, product._id)
                        if (products.title === 'Led Painting') {
                            setIsdesigns({
                                _id: product._id,
                                state: true
                            })
                        } else {
                            setSelectedImage({
                                _id: product._id,
                                image: products.imageOn
                            })
                            setIsproducts({ _id: '', state: false })
                            setIsdesigns({ _id: '', state: false })
                        }
                    }}
                >
                    <img
                        src={products.imageOn}
                        alt=''
                        width={128} height={128}
                    />
                    <h1>
                        {products.title}
                    </h1>
                </div>
            )
        }

    })

    function addDesignOptionsElent(id) {
        return Designs.map(design => {
            if (design.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
                return (
                    <div
                        key={design._id}
                        className='border-gray-500 z-50 border-b-2 p-4 bg-white'
                    >
                        <img
                            src={design.imageOn}
                            alt=''
                            // width={128} height={128}
                            className='size-32'
                            onClick={() => {
                                // setSelectedImage({
                                //     _id: product._id,
                                //     image: design.imageOn
                                // })
                                setAddedOrder(pre => ({ ...pre, image: design.imageOn }))
                                setIsAddedDesigns(pre => pre.filter(item => item !== id))
                                setIsAddedProducts(pre => pre.filter(item => item !== id))
                            }}
                        />
                    </div>
                )
            }

        })
    }

    function addProductsOptionsElent(id) {
        return Products.map(product => {
            if (product.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
                return (
                    <div
                        key={product._id}
                        className='flex p-4 z-50 border-gray-500 border-b-2 w-full items-center justify-between bg-white'
                        onClick={(e) => {
                            setAddedOrder(pre => {
                                return product.title === 'Led Painting'
                                    ? { ...product, }
                                    : { ...product, image: product.imageOn }
                            })
                            setIsAddedDesigns(pre => {
                                if (product.title === 'Led Painting') pre = [...pre, id]
                                return pre
                            })
                            if (product.title !== 'Led Painting') {
                                setIsAddedProducts(pre => {
                                    return pre.filter(item => item !== id)
                                })
                            }
                        }}
                    >
                        <img
                            src={product.imageOn}
                            alt=''
                            width={128} height={128}
                        />
                        <h1>
                            {product.title}
                        </h1>
                    </div>
                )
            }

        })
    }

    function addToOrders() {
        setNewOrders(pre => {
            pre = [
                ...pre,
                {
                    imageOn: addedOrder.image,
                    qnt: selectqnt,
                    title: addedOrder.title,
                    options: addedOrder.options,
                    _id: uuidv4()
                }
            ]

            // console.log(pre)
            setEditedOrder(prev => {
                return { ...prev, orders: pre }
            })
            return pre
        })
        setAddedOrder({})
        setSelectqnt(1)
        // handleUpdatingOrder(id)
    }

    const productOptsElement = addedOrder.options?.map(option => {
        return (
            <option
                key={option.title}
                value={option.title}
            >
                {option.title}
            </option>
        )
    })

    function handelOptChange(e) {
        const value = e.target.value
        let options = addedOrder.options
        const newOptions = options.map((option, i) => {
            if (option.title === value) {
                return { ...option, selected: true }
            }
            if (option.selected) {
                return { ...option, selected: false }
            }
            return option
        })
        setAddedOrder(pre => ({ ...pre, options: newOptions }))
    }

    const ordersElementFun = (product, i, order) => {

        if (isProductDeleted.includes(product._id)) return

        const galleryElement = product.gallery?.map(gallery => {
            return (
                <div
                    key={uuidv4()}
                    className='size-16'
                >
                    <img
                        src={gallery}
                        alt=''
                        className="w-full h-full object-fit"
                        width={64} height={64}
                    />
                </div>
            )
        })

        const optionElement = product.options?.map(option => {
            return (
                <option
                    value={option.title}
                    key={uuidv4()}
                    className="p-2"
                >
                    {option.title}
                </option>
            )
        })
        let slectedOption
        product.options?.forEach(option => {
            if (option.selected) {
                slectedOption = option.title
            }
        })

        return (
            <td
                key={i}
                className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] relative font-medium p-2 pr-4 text-center h-8"
            >
               {order._id !== editedOrderId &&
                <div 
                    className="absolute top-0 right-0 size-full"
                    onMouseOver={()=>setIsGallery(pre=>[...pre, product._id])}
                    onMouseOut={()=>setIsGallery(pre=>pre.filter(item => item !== product._id))}
                >
                    
                    {(isGallery.includes(product._id) && galleryElement) &&
                        <div 
                            className="absolute z-[999999999999] -bottom-28 right-0 flex bg-gray-200 shadow-lg rounded-md rounded-tr-none gap-2 p-6 w-max"
                        >   
                            <div className="absolute -top-5 right-0 size-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] border-b-gray-200"></div>
                            <div            
                                className='size-16'
                            >
                                <img
                                    src={product.imageOn}
                                    alt=''
                                    className="w-full h-full object-fit"
                                    width={64} height={64}
                                />
                            </div>
                            {galleryElement}
                        </div>
                    }
                </div>}

                {order._id === editedOrderId
                    ?
                    <select
                        onChange={(e) => handleOptChange(e, i)}
                        name="option"
                        defaultValue={slectedOption}
                        className='min-w-10 border border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                    >
                        {optionElement}
                    </select>
                    :
                    <div
                        className="mb-1 "
                    >
                        {slectedOption}
                    </div>
                }

                {order._id === editedOrderId &&
                    <div
                        className='absolute top-0 right-0 px-1 rounded-full bg-gray-200 cursor-pointer'
                        onClick={() => deleteOrderProduct(product._id)}
                    >
                        X
                    </div>
                }

                <img
                    className='w-auto m-auto h-8 z-10 relative'
                    src={selectedImage._id === product._id ? selectedImage.image : product.imageOn}
                    width={24} height={24} alt=""
                    key={product._id}
                    onClick={() => {
                        if (order._id === editedOrderId) {
                            setIsproducts(pre => ({
                                _id: product._id,
                                state: !pre.state
                            }))
                        }
                    }}
                />

                {isproducts.state && isproducts._id === product._id &&
                    <div className='max-w-96 border border-solid border-[rgba(0, 40, 100, 0.12)]  absolute mt-2 bg-white z-[99999999999999]'>
                        <div className='flex justify-center mt-2 border-b border-[rgba(0, 40, 100, 0.12)] z-50'>
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className={`pointer-events-none absolute left-60 top-6 ${search ? 'hidden' : 'opacity-50'}`}
                            />
                            <input
                                id="search"
                                type='search'
                                className='w-64 px-2 py-1 m-2 rounded-xl border border-[rgba(0, 40, 100, 0.12)] no-focus-outline text-black bg-stone-200'
                                placeholder={`Search`}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        {isdesigns.state && isdesigns._id === product._id
                            ? <div
                                className='grid grid-cols-2 max-h-[484px] z-50 overflow-y-auto'
                            >
                                {designOptionsElent}
                            </div>
                            : <div
                                className='max-h-[484px] w-80 z-50 overflow-y-auto'
                            >
                                {productsOptionsElent}
                            </div>
                        }
                    </div>
                }


                {order._id === editedOrderId
                    ? <input
                        type="number"
                        onChange={(e) => handleQntChange(e, i)}
                        name="qnt"
                        defaultValue={product.qnt}
                        min={1}
                        className='min-w-10 mt-2 border border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                    />
                    : <span
                        className="bg-red-500 absolute left-4 bottom-8 rounded-lg px-1 text-[10px] text-white text-center"
                    >
                        {product.qnt}
                    </span>
                }
            </td>
        )
    }

    function trackingBg(track){
        if(track === 'returned'){
            return redBg
        }
        if(track === 'En livraison'){
            return lightGreenBg
        }
        if(track === 'Suspendus'){
            return yellowBg
        }
        if(track === 'En preparation'){
            return darkBlueBg
        }
        if(track === 'livred'){
            return greenBg
        }
        if(track === 'Prêt à expédier'){
            return orangeBg
        }
        if(track === 'Vers Station'){
            return lightBlueBg
        }
        if(track === 'Vers Wilaya'){
            return darkBlueBg
        }
        return transparent
    }
    function stateBg(state){
        if(state === 'مؤكدة'){
            return greenBg
        }
        if(state === 'ملغاة'){
            return redBg
        }
        if(state === 'غير مؤكدة'){
            return orangeBg
        }
        if(state === 'لم يرد'){
            return yellowBg
        }
        return transparent
    }

    function handleSelecteOrder(order) {
        setSelectedOrders(pre=>{
            if(pre.some(item => item._id === order._id)){
                return pre.filter(item => item._id !== order._id)
            }
            return [...pre, order]
        })
    }

    async function handleSendMessage() {
        selectedOrders.forEach(async (order) => {
            // const res = await sandMessage(order.instaUserName, instaMessage)
            
        })
    }

    function ordersElement(data){

        return data.map((order, index) => {
            
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            if (filterOrders(order, currentDate) || reaserchedOrders.length > 0) {
                let cartItemsElemnt
                if (order.orders) {
                    cartItemsElemnt = order.orders.map((product, i) => ordersElementFun(product, i, order))
    
                    if (editedOrderId === order._id && Array.isArray(newOrders)) {
                        cartItemsElemnt = newOrders.map((product, i) => ordersElementFun(product, i, order))
                    }
                }
                if (editedOrderId === order._id) {
                    return (
                        <tr key={order._id} className={`h-5`}>
                            <td>
    
                                {/* {isDeleteAccess && deleting.some(item => item.id === order._id && item.state) &&
                                    <Spinner size={'h-8 w-8'} color={'border-red-500'} containerStyle={'ml-6 -mt-3'} />
                                }  
                                {isDeleteAccess && !deleting.some(item => item.id === order._id && item.state) &&
                                    <button
                                        className=' p-2 rounded-md'
                                        onClick={() => handleDelete(order._id)}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} className="text-red-700" />
                                    </button>                            
                                }   */}
    
                                <button
                                    onClick={() => {
                                        handleUpdatingOrder(order._id)
                                        orderIdToggel(order._id)
                                    }}
                                    className='px-3 py-2 ml-2  text-white bg-green-400 rounded-lg'
                                >
                                    save
                                </button>
                            </td>
                            <td className="bg-blue-100 text-sm">
                                <div className="flex items-center">
                                    <svg className='size-3 mr-1 text-blue-600' aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M0 448V64h18v384H0zm26.857-.273V64h36v383.727H26.857zM73.143 448V64h8.857v384h-8.857zM108 448V64h8.857v384H108zm44.857-27.143V64h18v356.857h-18zm36 27.143V64h8.857v384h-8.857zm35.715 0V64h18v384h-18zm44.857-26.857V64h8.857v357.143h-8.857zm35.715 26.857V64h8.857v384h-8.857zm35.714-17.714V64h8.857v366.286h-8.857zm17.714-366.286v356.571h-18V64h18zm44.857 356.571V64h18v384h-18zm44.857-8.857V64h18v375.143h-18zm35.715-8.857V64h18v366.286h-18zm26.857 8.857V64h36v383.727h-36zm45.143-.273V64h18v384h-18zm27.143 0V64h18v384h-18z"></path>
                                    </svg>
    
                                    {order.DLVTracking}
                                </div>
                            
                                
                            </td>
                            <td className="bg-blue-100">
                                {order.createdAt}
                            </td>
                            <td className="bg-blue-100">
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="name"
                                    defaultValue={editedOrder.name}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="bg-blue-100">
                                <input
                                    type='text'
                                    onChange={handleChange}
                                    name="phoneNumber"
                                    defaultValue={editedOrder.phoneNumber}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width '
                                />
                            </td>
                            <td className="bg-blue-100">
                               {editedOrder.state  === 'مؤكدة'
                                ?<div>{editedOrder.wilaya}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="wilaya"
                                    defaultValue={editedOrder.wilaya}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />}
                            </td>
                            <td className="bg-blue-100">
                               {editedOrder.state  === 'مؤكدة'
                                ?<div>{editedOrder.commune}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="commune"
                                    defaultValue={editedOrder.commune}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                               }
                            </td>
                            <td className="bg-blue-100">
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="adresse"
                                    defaultValue={editedOrder.adresse}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="bg-gray-200">
                                {editedOrder.state  === 'مؤكدة'
                                ?<div>{editedOrder.shippingMethod}</div>
                                :<select
                                    value={editedOrder.shippingMethod}
                                    onChange={handleChange}
                                    className="border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 "
                                    name="shippingMethod"
                                >
                                    <option value="بيت">بيت</option>
                                    <option value="مكتب">مكتب</option>
                                </select>
                                }
                            </td>
                            <td className="bg-gray-200">
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="shippingPrice"
                                    defaultValue={editedOrder.shippingPrice}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="bg-gray-200">
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="totalPrice"
                                    defaultValue={editedOrder.totalPrice}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="bg-gray-200">
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="note"
                                    defaultValue={editedOrder.note}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="bg-gray-200">
                               {editedOrder.state  === 'مؤكدة'
                                ?<div>{editedOrder.state}</div>
                                :<select
                                    onChange={handleChange}
                                    value={editedOrder.state}
                                    className="border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 max-w-32"
                                    name="state"
                                >
                                    <option 
                                        value="غير مؤكدة" 
                                        className="bg-yellow-300"
                                    >
                                        غير مؤكدة
                                    </option>
                                    <option 
                                        value="مؤكدة"
                                        className="bg-green-300"
                                    >
                                        مؤكدة
                                    </option>
                                    <option 
                                        value="لم يرد"
                                        className="bg-orange-300"
                                    >
                                        لم يرد
                                    </option>
                                    <option 
                                        value="ملغاة"
                                        className="bg-red-500"
                                    >
                                        ملغاة
                                    </option>
                                </select>
                            }
                            </td>
                            <td>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                    dateFormat="yyyy-MM-dd"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    onChange={handleChange}
                                    name="deliveryNote"
                                    defaultValue={editedOrder.deliveryNote}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                            </td>
                            <td className="text-center">
                                {(editedOrder.state === 'مؤكدة' && !editedOrder.inDelivery) 
                                ?<input type='checkbox'
                                    name="inDelivery"
                                    onChange={() => setEditedOrder(pre => ({
                                        ...pre,
                                        inDelivery: true
                                    })
                                    )}
                                    defaultChecked={editedOrder.inDelivery}
                                />
                                :order.inDelivery
                                ? <FontAwesomeIcon icon={faCheck} className={`text-green-500`} />
                                : <FontAwesomeIcon icon={faX} className={`text-orange-500`} />
                                }
                            </td>
                            <td>
                                <select
                                    value={editedOrder.tracking}
                                    onChange={handleChange}
                                    className="border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 max-w-32"
                                    name="tracking"
                                >
                                    <option hidden>Tracking</option>
                                    <option value="delivered">delivered</option>
                                    <option value="scheduled">scheduled</option>
                                    <option value="returned">returned</option>
                                </select>
                            </td>
                            {cartItemsElemnt}
                            <td>
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className='cursor-pointer'
                                    onClick={() => toggleIsAding(order._id)}
                                />
                                {isAddingProduct.includes(order._id) &&
                                    <div className='flex items-center justify-center gap-8'>
                                        {addedOrder.image
                                            ?
                                            <img
                                                src={addedOrder.image}
                                                alt=''
                                                width={64} height={64}
                                                onClick={() => {
                                                    setIsAddedProducts(pre => {
                                                        if (pre.includes(order._id)) {
                                                            return pre.filter(item => item !== order._id)
                                                        }
                                                        pre = [...pre, order._id]
                                                        return pre
                                                    })
                                                    setAddedOrder({})
                                                }}
                                            />
                                            :
                                            <div className='flex items-center gap-16'>
                                                <div>
                                                    <div
                                                        onClick={() => {
                                                            setIsAddedProducts(pre => {
                                                                if (pre.includes(order._id)) {
                                                                    return pre.filter(item => item !== order._id)
                                                                }
                                                                pre = [...pre, order._id]
                                                                return pre
                                                            })
                                                            setIsAddedDesigns(pre => pre.filter(item => item !== order._id))
                                                        }}
                                                        className='border border-gray-500 w-40 h-14 flex items-center p-2 cursor-pointer'
                                                    >
                                                        <p>Select a Product</p>
                                                    </div>
    
                                                    {isAddedProducts?.includes(order._id) &&
                                                        <div
                                                            className='max-w-96 bg-white border border-gray-500 z-50 absolute mt-2'
                                                        >
                                                            <div className='flex justify-center mt-2 border-b-2 border-gray-500'>
                                                                <FontAwesomeIcon
                                                                    icon={faMagnifyingGlass}
                                                                    className={`pt-2 pointer-events-none z-10 absolute left-64 ${search ? 'hidden' : 'opacity-50'}`}
                                                                />
                                                                <input
                                                                    id="search"
                                                                    type='search'
                                                                    className='w-64 px-2 py-1 rounded-xl border border-gray-500 no-focus-outline text-black bg-stone-200'
                                                                    placeholder={`Search`}
                                                                    onChange={(e) => setSearch(e.target.value)}
                                                                />
                                                            </div>
                                                            {isAddedDesigns?.includes(order._id)
                                                                ? <div
                                                                    className='grid grid-cols-2 max-h-[484px] z-50 overflow-y-auto'
                                                                >
                                                                    <div className='border-gray-500 z-50 border-b-2 p-4 bg-white flex items-center '>
                                                                        <div className='border border-dashed border-slate-800 relative size-32 text-center flex justify-center items-center '>
                                                                            <span
                                                                                className='absolute top-1/3'
                                                                            >
                                                                                Add a custom
                                                                            </span>
                                                                            <input
                                                                                type='file'
                                                                                onChange={(e) => {
                                                                                    handleFileUpload(e)
                                                                                    setIsAddedDesigns(pre => pre.filter(item => item !== order._id))
                                                                                    setIsAddedProducts(pre => pre.filter(item => item !== order._id))
                                                                                }}
                                                                                className='size-full opacity-0 m-0'
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    {addDesignOptionsElent(order._id)}
                                                                </div>
                                                                : <div
                                                                    className='max-h-[484px] w-80 z-50 overflow-y-auto'
                                                                >
                                                                    {addProductsOptionsElent(order._id)}
                                                                </div>
                                                            }
                                                        </div>
                                                    }
                                                </div>
    
                                            </div>
                                        }
                                        <input
                                            type="number"
                                            placeholder='Qntity'
                                            value={selectqnt}
                                            className='w-10 h-14 rounded-md border border-gray-600 pl-1 dynamic-width'
                                            min={1}
                                            onChange={(e) => setSelectqnt(e.target.value)}
                                        />
    
                                        {productOptsElement?.length > 0 &&
                                            <select
                                                name="options"
                                                onChange={handelOptChange}
                                                className='m-0 p-2 h-14 rounded-md border border-gray-600'
                                            >
                                                <option hidden>
                                                    اختر الخيار
                                                </option>
                                                {productOptsElement}
                                            </select>
                                        }
    
                                        <button
                                            className='bg-green-300 px-3 py-2 rounded-lg'
                                            onClick={addToOrders}
                                        >
                                            Add
                                        </button>
    
                                    </div>
                                }
                            </td>
                        </tr>
                    )
                } else {
                    return (
                        <tr
                            key={order._id}
                            className={`h-5 ${saving.includes(order._id) && 'opacity-40'} ${deleting.some(item => item.id === order._id && item.state) && 'opacity-40'}`}
                        >
                            {(isUpdateAccess || isDeleteAccess || isCrafting || isLabels || isOrderAction) && (
                                <td>
                                    {saving.includes(order._id)
                                        ?
                                        <Spinner size={'w-8 h-8'} color={'border-green-500'} containerStyle={'ml-6 -mt-3'} />
                                        :
                                        <div className=" whitespace-nowrap flex items-center justify-center">
                                            {(isCrafting || isSending ||(isLabels && order?.DLVTracking)||isOrderAction) &&
                                                <div className="p-2 flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="size-4 m-0"
                                                        checked={selectedOrders.some(item => item._id === order._id)}
                                                        onChange={(e) => handleSelecteOrder(order)} 
                                                    />
                                                </div>
                                            }
                                            {/* {isDeleteAccess && deleting.some(item => item.id === order._id && item.state) &&
                                                <Spinner size={'h-8 w-8'} color={'border-red-500'} containerStyle={'ml-6 -mt-3'} />
                                            }  
                                            {isDeleteAccess && !deleting.some(item => item.id === order._id && item.state) &&
                                                <button
                                                    className=' p-2 rounded-md'
                                                    onClick={() => handleDelete(order._id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} className="text-red-700" />
                                                </button>                            
                                            }   */}
                                            {isUpdateAccess &&
                                            <button
                                                onClick={() => {
                                                    setEditedOrderId(order._id)
                                                    setEditedOrder(order)
                                                }}
                                                disabled={editedOrderId !== order._id && editedOrderId !== '' || saving.includes(order._id)}
                                                className={` text-white 
                                                ${saving._id === order._id && saving.stat && 'w-8 h-10 relative'}
                                                ${deleting.some(item => item.id === order._id) && 'hidden'}
                                                rounded-lg px-3 py-2
                                            `}
                                            >
                                                <FontAwesomeIcon icon={faPen} className='text-green-600' />
                                            </button>
                                            }
                                        </div>
                                    }
                                </td>
                            )}
                            <td className="bg-blue-100 text-sm">
                                <div className="flex items-center">
                                    <svg className='size-3 mr-1 text-blue-600' aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                        <path fill="currentColor" d="M0 448V64h18v384H0zm26.857-.273V64h36v383.727H26.857zM73.143 448V64h8.857v384h-8.857zM108 448V64h8.857v384H108zm44.857-27.143V64h18v356.857h-18zm36 27.143V64h8.857v384h-8.857zm35.715 0V64h18v384h-18zm44.857-26.857V64h8.857v357.143h-8.857zm35.715 26.857V64h8.857v384h-8.857zm35.714-17.714V64h8.857v366.286h-8.857zm17.714-366.286v356.571h-18V64h18zm44.857 356.571V64h18v384h-18zm44.857-8.857V64h18v375.143h-18zm35.715-8.857V64h18v366.286h-18zm26.857 8.857V64h36v383.727h-36zm45.143-.273V64h18v384h-18zm27.143 0V64h18v384h-18z"></path>
                                    </svg>
    
                                    {order.DLVTracking}
                                </div>
                                
                                
                            </td>
                            <td className="bg-blue-100">
                                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    timeZone: 'Africa/Algiers' // Timezone for Algeria
                                })}
                                <br />
                                {new Date(order.createdAt).toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    timeZone: 'Africa/Algiers' // Timezone for Algeria
                                })}
                            </td>
                            <td className="bg-blue-100">{order.name}</td>
                            <td className="bg-blue-100">{order.phoneNumber}</td>
                            <td className="bg-blue-100">{order.wilaya}</td>
                            <td className="bg-blue-100">{order.commune}</td>
                            <td className="bg-blue-100">{order.adresse}</td>
                            <td className="bg-gray-200">{order.shippingMethod}</td>
                            <td className="bg-gray-200">{order.shippingPrice}</td>
                            <td className="bg-gray-200">{order.totalPrice}</td>
                            <td className="relative bg-gray-200 max-w-40 whitespace-nowrap overflow-hidden text-ellipsis hover:overflow-visible group">
                                <div className="overflow-hidden text-ellipsis">
                                    {order.note}
                                </div>
                                <div className="absolute top-0 left-0 mt-2 w-max max-w-xs p-2 bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {order.note}
                                </div>
                            </td>
                            <td className='relative bg-gray-200'>
                                <div className="opacity-0">
                                    {order.state}
                                </div>
                                <div className='z-10 absolute top-1/2 right-3 -translate-y-1/2'>
                                    {order.state}
                                </div>
                                <Image 
                                    src={stateBg(order.state)} 
                                    alt='' 
                                    width={52} height={52} 
                                    className='absolute top-1/2 right-1 -translate-y-1/2'
                                />
                            </td>
                            <td>{order.schedule}</td>
                            <td className="relative  max-w-40 whitespace-nowrap overflow-hidden text-ellipsis hover:overflow-visible group">
                                <div className="overflow-hidden text-ellipsis">
                                    {order.deliveryNote}
                                </div>
                                <div className="absolute top-0 left-0 mt-2 w-max max-w-xs p-2 bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {order.deliveryNote}
                                </div>
                            </td>
                            <td className="text-center">
                                {order.inDelivery
                                    ? <FontAwesomeIcon icon={faCheck} className={`text-green-500`} />
                                    : <FontAwesomeIcon icon={faX} className={`text-orange-500`} />
                                }
                            </td>
                            <td className='relative'>
                                <div className="opacity-0">
                                    {order.tracking}
                                </div>
                                <div className='z-10 text-center w-full whitespace-nowrap  pl-6 absolute top-1/2 right-3 -translate-y-1/2'>
                                    {order.tracking}
                                </div>
                                <Image 
                                    src={trackingBg(order.tracking)} 
                                    alt='' 
                                    width={64} height={64} 
                                    className='absolute opacity-50 top-1/2 right-3 w-3/4 -translate-y-1/2'
                                />
                            </td>
                            {cartItemsElemnt}
                        </tr>
                    )
    
                }
            }
        })
    }

    const dateFilterArray = [
        'today', 'yesterday', 'this Week', 'this Month', 'maximum'
    ]
    const dateFilterElements = dateFilterArray.map((value, i) => (
        <option
            key={i}
            value={value}
            className='capitalize'
            selected={value === dateFilter}
        >
            {value}
        </option>
    ))

    const generateOrdersPDF = (data) => {
        
        if(!data || data.length === 0 ) return setErrorNotifiction(`select orders to generate pdf`)
            
        const doc = new jsPDF();
            
            
        doc.addFileToVFS('arabic.ttf',  AmiriFont);
        doc.addFont('arabic.ttf', 'Arabic', 'normal');
        doc.setFont('Arabic');

    
        const colors = ['#e3f2fd', '#f5f5f5']; // Light blue and light gray colors
        let colorIndex = 0; // Index to alternate colors
    
        let ordersPerPage = 5; // Number of orders per page
        let orderIndex = 0; // Current order index on the page
    
        data.forEach((order, index) => {
            
            if(order.orders.length === 0) return setErrorNotifiction(`couldnt generate pdf for order ${order.name}`)


            if (orderIndex === ordersPerPage) {
                doc.addPage(); // Add a new page when the current page has 5 orders
                orderIndex = 0; // Reset order index for the new page
            }
    
            // Calculate vertical position for the current order
            const yPos = 10 + orderIndex * 60;
            doc.setFontSize(16);
    
            // Set background color for each order
            const bgColor = colors[colorIndex % colors.length];
            doc.setFillColor(bgColor);
            doc.rect(10, yPos, 190, 50, 'F'); // Adjust rectangle dimensions based on your layout
    
            // Add customer information for each order
            doc.setTextColor('#000000');
            const customerInfo = `${order.name}, ${order.wilaya}`;
            doc.text(customerInfo, 15, yPos + 10);
    
            order.orders.forEach((item, i) => {
                if(!item.imageOn || !item.qnt) return setErrorNotifiction(`couldnt generate pdf for order ${order.name}`)


                doc.setFontSize(16);
                // Add quantity and image (resized to 16x16 pixels)
                doc.text(`${item.qnt}`, 22 + i * 30, yPos + 20);
                doc.addImage(item.imageOn, 'JPEG', 15 + i * 30, yPos + 23, 16, 16);
    
                // Add selected option, if available
                const selectedOption = item.options.find(opt => opt.selected);
                if (selectedOption) {
                    doc.setFontSize(12);
                    doc.text(selectedOption.title, 15 + i * 30, yPos + 45);
                }
            });
    
            colorIndex++; // Move to the next color for the next order
            orderIndex++; // Move to the next order position on the current page
        });
    
        // Output the PDF as a Blob
        const pdfBlob = doc.output('blob');
    
        // Create a URL for the Blob and open it in a new window
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl);
    };
    
    const generateLabelsPDF = async (data) => {
        setLablesLoading(true);
        // Create a new PDF document
        const combinedPdf = await PDFDocument.create();
    
        for (const order of data) {
            const res = await axios.get(`https://tsl.ecotrack.dz/api/v1/get/order/label`, {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TSL_API_KEY}`
                },
                params: {
                    tracking: order.DLVTracking
                },
                responseType: 'arraybuffer'  // Handle binary data correctly
            });
    
            // Create a PDF document from the response data
            const pdfDoc = await PDFDocument.load(res.data);
            const pages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    
            pages.forEach(page => combinedPdf.addPage(page));
        }
    
        // Serialize the combined PDF to bytes
        const pdfBytes = await combinedPdf.save();
    
        // Create a Blob from the PDF data
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
    
        // Open the combined PDF in a new window
        window.open(url, '_blank');
        setLablesLoading(false);
    };
    
    const trackingFiltersArray=[
        {
            name:'unconfirmed',
            icon:'not confirmed.png'      
        },{
            name:'Scheduled',
            icon:'Schedule.png'      
        },{
            name:'Prêt à expédier',
            icon:'Prêt à expédier.png'      
        },{
            name:'En ramassage',
            icon:'En ramassage.png'          
        },{
            name:'Vers Station',
            icon:'vers Station.png'          
        },{
            name:'Vers Wilaya',
            icon:'Vers Wilaya.png'          
        },{
            name:'En preparation',
            icon:'En preparation.png'          
        },{
            name:'En livraison',
            icon:'En livraison.png'          
        },{
            name:'Suspendus',
            icon:'Suspendus.png'          
        },{
            name:'livred',
            icon:'livres.png'          
        },{
            name:'returned',
            icon:'returns.png'          
        }
    ]

    const trackingFiltersEle=trackingFiltersArray.map(({name,icon},i)=>{

        let ordersNumber = 0
        if(name ==='Scheduled'){
            Orders?.forEach(order => {
                const currentDate = format(new Date(), 'yyyy-MM-dd');
    
                // Check if the saved date is the same as today
                const isSameAsToday = order.schedule === currentDate;
                if (isSameAsToday) ordersNumber++
            })
        }else if(name ==='unconfirmed'){
            ordersNumber = Orders.filter(order=>order.state !== 'مؤكدة').length
        }else{
            ordersNumber = Orders.filter(order=>order.tracking===name).length
        }


        return(
            <div 
                key={name}
                className={`cursor-pointer flex ${i === 0 ? '' : 'border-l'} px-4 py-3 border-gray-400 items-center ${trackingFilter === name ? 'bg-[#057588] text-[#fff] ' : ' hover:bg-[#057588] bg-[#fff] hover:text-[#fff]'} gap-2`}
                onClick={()=>{
                    setTrackingFilter(name)
                    setIsSearching(false)
                    setReaserchedOrders([])
                }}
            >
                <img 
                    src={`/assets/tracking Icon/${icon}`} alt=""
                    className="max-w-4 max-h-4"
                /> 
                <p className="text-sm whitespace-nowrap ">{name}</p>
                {ordersNumber>0 &&
                    <p 
                        className='bg-[#777] text-xs font-semibold text-[#fff]  px-1 rounded-sm'
                    >
                        {ordersNumber}
                    </p>
                }
            </div>
        )
    })
    
    async function handleSearch() {
        const phonePattern = /^0\d{9}$/;
        if(searchingMethode === 'phoneNumber' && !phonePattern.test(serachingValue)) return setErrorNotifiction('Please enter a valid phone number')

        const orders = await getOrder(searchingMethode, serachingValue)

        setReaserchedOrders(orders)
    }
    return (
        <div className="py-4 relative pl-4 pr-48 flex flex-col gap-5 h-screen overflow-x-auto w-full min-w-max">

            <div 
                className={`bg-green-200 transition-all duration-200 flex items-center gap-2 fixed top-16 right-6 z-[9999999999999999999999] border border-gray-400 px-4 py-2 rounded 
                            ${successNotifiction ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}
                          `}
            >
                <FontAwesomeIcon 
                    icon={faCheck} 
                    className={`text-white bg-green-500 p-1 text-xs rounded-full`} 
                />
                {successNotifiction}
            </div>

            <div 
                className={`bg-red-200 transition-all duration-200 flex items-center gap-2 fixed top-16 right-6 z-[9999999999999] border border-gray-400 px-4 py-2 rounded 
                            ${errorNotifiction ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}
                          `}
            >
                <FontAwesomeIcon 
                    icon={faX} 
                    className={`text-white bg-red-500 p-1 text-xs rounded-full`} 
                />
                {errorNotifiction}
            </div>

            <div className="w-ful h-11 fixed top-0 left-32 md:left-72 sm:left-48 shadow-md flex z-[9999999999999999999]">
                {trackingFiltersEle}
                <div 
                    className={`cursor-pointer flex px-4 py-3 border-l border-gray-400 items-center ${isSearching ? 'bg-[#057588] text-[#fff] ' : ' hover:bg-[#057588] bg-[#fff] hover:text-[#fff]'} gap-2`}
                    onClick={() =>{
                        setIsSearching(pre=>!pre)
                        setTrackingFilter('')
                    }}
                >
                    <FontAwesomeIcon icon={faMagnifyingGlass} /> 
                </div>
            </div>

            {!isSearching && 
            <div
                className="flex items-center w-max mt-11 justify-start gap-12"
            >
                <div className='flex gap-4'>
                    <div className='relative'>
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className={`absolute left-72 top-0 pt-3 z-10 ${search ? 'hidden' : 'opacity-50'}`}
                        />
                        <input
                            onChange={e => setSearch(e.target.value)}
                            type="search"
                            placeholder="Search"
                            className='w-80 p-2 border border-gray-500 rounded-xl no-focus-outline'
                        />
                    </div>
                </div>


               {/* {isSending
                ?<div 
                    className="relative border-gray-500 border p-2 px-4 rounded-xl"
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                >
                    <input 
                        type="text" 
                        placeholder="Enter your message"
                        className="no-focus-outline w-40"
                        value={instaMessage}
                        onChange={e => setInstaMessage(e.target.value)}
                    />
                    <FontAwesomeIcon 
                        icon={faPaperPlane} 
                        onClick={() => handleSendMessage()}
                        className="cursor-pointer text-gray-600"
                    />
                    <div 
                        className="absolute -top-2 -right-2 flex items-center bg-red-500 p-1 rounded-full"
                        onClick={() => setIsSending(pre => !pre)}
                    >
                        <FontAwesomeIcon 
                            icon={faX} 
                            className="cursor-pointer size-3 text-white"
                        />
                    </div>


                </div>
                :<div 
                    className="border-gray-500 border p-2 px-4 rounded-xl cursor-pointer"
                    onClick={() => setIsSending(pre => !pre)}
                >
                    Send instagram Message
                </div>
               } */}
                <div className="relative">
                    <div
                        className='relative flex whitespace-nowrap justify-self-end border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                        onClick={() => {
                            setIsOrderAction(pre=>!pre)
                        }}
                    >
                        {orderAction ? orderAction : 'order Action'}
                        <Image 
                            src={downArrow} alt=""
                            width={24} height={24}
                            className={`ml-2 transition-all  ${isOrderAction ? 'rotate-180 -translate-y-1' : 'translate-y-1'}`}
                        />
                    </div>
                    {isOrderAction &&
                     <div
                        className="absolute rounded-lg top-12 right-1/2 translate-x-1/2 border z-[99999999999999999] border-gray-500 flex flex-col bg-white items-center"
                    >
                        <div 
                            className="px-2 whitespace-nowrap p-1 cursor-pointer border-b-2 border-gray-500  w-full text-start"
                            onClick={() =>{
                                confirmMultibel(selectedOrders)
                                setIsOrderAction(pre=>!pre)
                            }}
                        >
                            Confirm
                        </div>
                        <div 
                            className="px-2 whitespace-nowrap cursor-pointer p-1 w-full text-start"
                            onClick={() =>{
                                validateMultibelToTSL(selectedOrders,0)
                                setIsOrderAction(pre=>!pre)
                            }}
                        >
                            validate To TSL
                        </div>
                        <div 
                            className="px-2 whitespace-nowrap cursor-pointer p-1 border-t-2 border-gray-500 w-full text-start"
                            onClick={() =>{
                                validateMultibelToTSL(selectedOrders,1)
                                setIsOrderAction(pre=>!pre)
                            }}
                        >
                            validate with ramasage
                        </div>
                    </div>}
                </div>
                <div
                    className='relative whitespace-nowrap justify-self-end border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                    onClick={() => {
                        if(isCrafting) {
                            setIsCrafting(pre => !pre)
                            generateOrdersPDF(selectedOrders)
                        }else{
                            setIsCrafting(pre => !pre)
                        }
                    }}
                >
                    {isCrafting ? 'Show PDF' : 'start Crafting'}
                </div>

                <div
                    className='relative h-11 min-w-28 whitespace-nowrap justify-self-end border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                    onClick={() => {
                        if(isLabels) {
                            setIsLabels(pre => !pre)
                            generateLabelsPDF(selectedOrders)
                        }else{
                            setIsLabels(pre => !pre)
                        }
                    }}
                >
                    {lablesLoading && 
                        <Spinner size={'size-6'} containerStyle={'ml-8'} />
                    }
                    {(isLabels && !lablesLoading) && 'Show PDF' }
                    {(!isLabels && !lablesLoading) && 'Get labels' }
                </div>

                <select
                    name="date"
                    onChange={handleDateFilterChange}
                    className="ml-auto capitalize border-gray-500 border p-2 px-4 rounded-xl cursor-pointer"
                >
                    {dateFilterElements}
                </select>

                {isCreateAccess &&
                    <Link
                        className='justify-self-end  whitespace-nowrap border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                        href={'/admin/orders/add'}    
                        >
                        <FontAwesomeIcon icon={faPlus} />
                        <span className="ml-2 whitespace-nowrap">Add a new order</span>
                    </Link>
                }
            </div>
            }

            {!isSearching?  
            <div className="relative h-[700px] overflow-y-auto w-full">
                <table border={0} className="font-normal w-full ml-auto" style={{ borderSpacing: '0' }}>
                    <thead className="sticky top-0 z-[999999999] border border-gray-500 bg-white">
                            <tr>
                        {(isUpdateAccess || isDeleteAccess || isCrafting) && (
                            <th>
                                <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    تعديل       
                                </div>
                            </th>
                        )}
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    Ref
                                </div>
                                    
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    التاريخ
                                </div>
                                    
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الأسم
                                </div>
                                    
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الرقم
                                </div>
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الولاية
                                </div>
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    البلدية 
                                </div>
                            </th>
                            <th className="bg-blue-100">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    عنوان    
                                </div>
                            </th>
                            <th className="bg-gray-200">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    نوع التوصيل 
                                </div>
                            </th>
                            <th className="bg-gray-200">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    سعر التوصيل 
                                </div>
                            </th>
                            <th className="bg-gray-200">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    سعر كلي 
                                </div>
                            </th>
                            <th className="bg-gray-200">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    ملاحضة   
                                </div>
                            </th>
                            <th className="bg-gray-200">
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الحالة   
                                </div>
                            </th>
                            <th>
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    التأجيل    
                                </div>
                            </th>
                            <th>
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    ملاحظة التوصيل 
                                </div>
                            </th>
                            <th>
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    في التوصيل 
                                </div>
                            </th>
                            <th>
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    التتبع      
                                </div>
                            </th>
                            <th colSpan={longesOrder.length}>
                                <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                الطلبيات      
                                </div>
                            </th>
                           
                        </tr>
                    </thead>
                    <tbody>
                        {ordersElement(Orders)}
                    </tbody>
                </table>
            </div>
            :<div className="w-full mt-11">
                <div
                    className="flex w-full gap-6 border border-[rgba(0, 40, 100, 0.12)] bg-white p-5 py-2"
                >
                    <select 
                        value={searchingMethode}
                        onChange={e => setSearchingMethode(e.target.value)}
                        className="w-1/4 px-3 text-sm rounded py-1 bg-white border border-[rgba(0, 40, 100, 0.12)]"
                    >
                        <option value="phoneNumber">Phone Number</option>
                        <option value="DLVTracking">Tracking</option>
                    </select>

                    <input 
                        type="text"
                        value={serachingValue}
                        onChange={e => setSerachingValue(e.target.value)}
                        placeholder="Phone Number, Tracking  " 
                        className="w-1/3 px-3 text-sm rounded py-1 bg-white border border-[rgba(0, 40, 100, 0.12)]"
                    />

                    <div className="flex-grow ">
                        <button 
                            className="px-3 py-2 gap-2 bg-[#f5f5f5] rounded shadow-inner text-sm flex items-center border border-[rgba(0, 40, 100, 0.12)]"
                            disabled={!serachingValue}
                            onClick={handleSearch}
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-blue-600 h-3" />
                            <span>Search</span>
                        </button>
                    </div>
                </div>
                <div className="relative mt-14 h-[700px] overflow-y-auto w-full">

                    <table border={0} className="font-normal w-full ml-auto" style={{ borderSpacing: '0' }}>
                        <thead className="sticky top-0 z-[999999999] border border-[rgba(0, 40, 100, 0.12)] bg-white">
                                <tr>
                            {(isUpdateAccess || isDeleteAccess || isCrafting) && (
                                <th>
                                    <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        تعديل       
                                    </div>
                                </th>
                            )}
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        Ref
                                    </div>
                                        
                                </th>
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        الأسم
                                    </div>
                                        
                                </th>
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        الرقم
                                    </div>
                                </th>
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        الولاية
                                    </div>
                                </th>
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        البلدية 
                                    </div>
                                </th>
                                <th className="bg-blue-100">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        عنوان    
                                    </div>
                                </th>
                                <th className="bg-gray-200">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        نوع التوصيل 
                                    </div>
                                </th>
                                <th className="bg-gray-200">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        سعر التوصيل 
                                    </div>
                                </th>
                                <th className="bg-gray-200">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        سعر كلي 
                                    </div>
                                </th>
                                <th className="bg-gray-200">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        ملاحضة   
                                    </div>
                                </th>
                                <th className="bg-gray-200">
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        الحالة   
                                    </div>
                                </th>
                                <th>
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        التأجيل    
                                    </div>
                                </th>
                                <th>
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        ملاحظة التوصيل 
                                    </div>
                                </th>
                                <th>
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        في التوصيل 
                                    </div>
                                </th>
                                <th>
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        التتبع      
                                    </div>
                                </th>
                                <th colSpan={longesOrder.length}>
                                    <div className=" border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الطلبيات      
                                    </div>
                                </th>
                            
                            </tr>
                        </thead>
                        <tbody>
                            {reaserchedOrders.length > 0 && ordersElement(reaserchedOrders)}
                        </tbody>
                    </table>
                </div>
            </div>
            }



        </div>
    )
}

export default Orders