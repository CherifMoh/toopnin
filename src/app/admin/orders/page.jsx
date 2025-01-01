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
import { faMagnifyingGlass, faPen, faPlus, faX, faCheck, faPaperPlane, faArrowDown, faAngleDown, faBan, faTriangleExclamation, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { addOrder, addOrderSchedule, addOrderToZR, addToBlackList, checkEmailAllowance, deleteOrder, expedieOrderToZR, fetchAllOrderStatuses, fetchShopify, getOrder, updateShopifyDate, ZrfetchDate } from '../../actions/order'
import { editAddProduct, editMinusProduct } from '../../actions/storage'
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'
import {AmiriFont} from '../../data/AmiriFont'
import * as XLSX from 'xlsx';

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
import { fetchOrderStatus } from "../../actions/order";
import { generateUniqueString } from "../../lib/utils";
import { ConvertCommuneToJSON, getTrafication, getWilayas, updateWilayas } from "../../actions/wilayas";
import { title } from "process";


async function fetchOrders(date) {

    const res = await axios.get('/api/orders', {
        params: { date: date }
    });
    return res.data;
}
async function fetchZrOrders() {
    const res = await axios.get('/api/orders/zrOrders');
    return res.data;
}
async function fetchLivreurOrders() {
    const res = await axios.get('/api/orders/livreurOrders');
    return res.data;
}


async function fetchProducts() {
    const res = await axios.get('/api/products');
    return res.data;
}

async function fetchWilayt() {
    const res = await axios.get('/api/wilayas/wilayasCodes');
    return res.data.wilayas;
}

async function fetchCommunes() {
    const res = await axios.get('/api/wilayas/communes');
    return res.data.communes;
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
    const { data: ZrOrders, isLoading : zrOrdersLoding, isError:ZrOrdersIsError, error:ZrOrdersError } = useQuery({
        queryKey: ['zr orders'],
        queryFn: fetchZrOrders,
        // enabled: !!dateFilter,
    });
    const { data: LivreurOrders, isLoading : LivreurOrdersLoding, isError:LivreurOrdersIsError, error:LivreurOrdersError } = useQuery({
        queryKey: ['Livreur orders'],
        queryFn: fetchLivreurOrders,
        // enabled: !!dateFilter,
    });


    const { data: Products, isLoading: ProductsLoding, isError: ProductsIsError, error: ProductsErr } = useQuery({
        queryKey: ['Admin All Products'],
        queryFn: fetchProducts
    });

    const { data: communes, isLoading: communesLoding, isError: communesIsErr, error: communesErr } = useQuery({
        queryKey: ['communes'],
        queryFn: fetchCommunes
    });
    
    const { data: wilayat, isLoading: wilayatLoding, isError: wilayatIsErr, error: wilayatErr } = useQuery({
        queryKey: ['wilayat'],
        queryFn: fetchWilayt
    });

    const [editedOrder, setEditedOrder] = useState({})

    const [editedOrderId, setEditedOrderId] = useState('')

    const [selectedDate, setSelectedDate] = useState(null);

    const [selectedImage, setSelectedImage] = useState({ _id: '', image: '' });

    const [search, setSearch] = useState('')

    const [orderAction, setOrderAction] = useState('')
    const [isOrderAction, setIsOrderAction] = useState(false)

    const [isproducts, setIsproducts] = useState({ _id: '', state: false })

    const [isProductDeleted, setIsProductDeleted] = useState([])

    const [newOrders, setNewOrders] = useState({})
    
    const [trackingFilter, setTrackingFilter] = useState('غير مؤكدة')
    
    const [isAddingProduct, setIsAddingProduct] = useState([])
    const [addedOrder, setAddedOrder] = useState({})
    const [isAddedProducts, setIsAddedProducts] = useState([])
    const [selectqnt, setSelectqnt] = useState(1)
    
    const [isGallery, setIsGallery] = useState([])

    const [scheduleQnt, setScheduleQnt] = useState()
    
    const [deliveryAgentSlection, setDeliveryAgentSlection] = useState(false)
    const [deliveryAgent, setDeliveryAgent] = useState()

    const [isSchedule, setIsSchedule] = useState(false)

    const [errorNotifiction, setErrorNotifiction] = useState('')
    const [successNotifiction, setSuccessNotifiction] = useState('')

    const [saving, setSaving] = useState([])

    const [lablesLoading, setLablesLoading] = useState(false)

    const [isSending, setIsSending] = useState(false)
    const [instaMessage, setInstaMessage] = useState('')
    
    const [selectedOrders, setSelectedOrders] = useState([])
    const [isCrafting, setIsCrafting] = useState(false)
    const [isExcel, setisExcel] = useState(false)

    const [isCreateAccess, setIsCreateAccess] = useState(false)
    const [isUpdateAccess, setIsUpdateAccess] = useState(false)
    const [isDeleteAccess, setIsDeleteAccess] = useState(false)
    const [isArchiveAccess, setIsArchiveAccess] = useState(false)
    const [isExcelAccess, setIsExcelAccess] = useState(false)
    const [isIpBlockAccess, setIsIpBlockAccess] = useState(false)
    const [superEdit, setSuperEdit] = useState(false)
    
    const [ordersUpdted, setOrdersUpdted] = useState(false)
    
    const [isSearching, setIsSearching] = useState(false)
    const [searchingMethode, setSearchingMethode] = useState('phoneNumber')
    const [serachingValue, setSerachingValue] = useState()
    const [reaserchedOrders, setReaserchedOrders] = useState([])

    const [isTrakingFilterDrop, setIsTrakingFilterDrop] = useState('')

    const [slectedCommunes, setSlectedCommunes] = useState([]);

    const [wilayaSearch, setWilayaSearch] = useState('')
    const [isWilayaDropdown, setIsWilayaDropdown] = useState(false);
    const [selectedWilaya, setSelectedWilaya] = useState("الولاية");
    
    const [communeSearch, setCommuneSearch] = useState('')
    const [isCommuneDropdown, setIsCommuneDropdown] = useState(false);
    const [selectedCommune, setSelectedCommune] = useState("البلدية");
    
    
    const [isMessage, setIsMessage] = useState(false)
    const [message, setMessage] = useState('')
    const [messageOrder, setMessageOrder] = useState({})

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
        setSuperEdit(access.accessibilities.includes('superEdit'))
        setIsDeleteAccess(access.accessibilities.includes('delete'))
        setIsUpdateAccess(access.accessibilities.includes('update'))
        setIsCreateAccess(access.accessibilities.includes('create'))
        setIsArchiveAccess(access.accessibilities.includes('archive'))
        setIsExcelAccess(access.accessibilities.includes('excel'))
        setIsIpBlockAccess(access.accessibilities.includes('IP block'))
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

    // useEffect(()=>{
    //     if(!Orders) return

    //     const o = Orders.filter(order => order.state === 'غير مؤكدة' )
    //     o.forEach(order => {
    //         deleteOrder(order._id)
    //         console.log(order.name)
    //         queryClient.invalidateQueries('orders');
    //     })

    // },[Orders])

    useEffect(() => {
        let isMounted = true;
    
        if (!ZrOrders ||!LivreurOrders || ordersUpdted) return;
    
        setOrdersUpdted(true);
       
        const fetchAndUpdateOrders = async () => {
            try {
                const dateFilter = await ZrfetchDate()
                console.log(dateFilter)
                if(!dateFilter) return
                liveUpdateOrders()
                const relevantOrders = ZrOrders.filter(
                    (order) =>
                        order.deliveryAgent === 'ZR' &&
                        order.state === 'مؤكدة'
                );
                
                
                if (relevantOrders.length === 0) return;
                
               
                // Fetch tracking statuses for all relevant orders
                let trackingData = await fetchAllOrderStatuses(relevantOrders);
              
                trackingData = trackingData.Colis
                console.log(relevantOrders.length)
                console.log(trackingData)
               
                // Update orders in the database
                await Promise.all(
                    relevantOrders.map(async (order,i) => {
                       
                        const matchingOrder = trackingData.find((item) => item.Tracking === order.DLVTracking);                        

                        const newTracking = await getOrderStatus(order,matchingOrder);
                        if ( !newTracking || newTracking === order.tracking) return;
                        
                        let newOrder = { ...order, tracking: newTracking };

                        if(newOrder.tracking === 'Prêt à expédier') newOrder.inDelivery = true

                        
                        const res = await axios.put(`/api/orders/${order._id}`, newOrder, {
                            headers: { 'Content-Type': 'application/json' },
                        });
                    
                    })
                );
    
                queryClient.invalidateQueries(['orders', dateFilter]);
            } catch (err) {
                setOrdersUpdted(false);
                console.log(err);
            }
        };

        async function liveUpdateOrders() {
            const dateFilter = await ZrfetchDate()
            console.log(dateFilter)
            if(!dateFilter) return
            LivreurOrders.forEach(async(order) => {
                if(order.state === 'مؤكدة'&& order.inDelivery &&( order.tracking === 'En Préparation' || order.tracking === 'Prêt à expédier')){
                    const newOrder = { ...order, tracking: 'Prêt à expédier L' };
                    
                    const res = await axios.put(`/api/orders/${order._id}`, newOrder, {
                        headers: { 'Content-Type': 'application/json' },
                    });
                }
            })
        }
    
        fetchAndUpdateOrders();
        liveUpdateOrders()
    
        return () => {
            isMounted = false;
        };
    }, [ZrOrders,LivreurOrders, ordersUpdted, queryClient]);
    

    useEffect(() => {
        if (!communes|| !wilayat||!editedOrder?.wilaya) return
  
        const wilayaCode = wilayat.find(wilaya => wilaya.wilaya_name === editedOrder?.wilaya).wilaya_id
  
  
        const communesArray = Object.values(communes);
        const filteredCommunes = communesArray.filter(commune => commune.wilaya_id === wilayaCode);
  
        setSlectedCommunes(filteredCommunes)
  
      }, [editedOrder?.wilaya,communes,wilayat])


    useEffect(() => {
        if(!editedOrder) return
        if(editedOrder.wilaya) setSelectedWilaya(editedOrder.wilaya)
        if(editedOrder.commune) setSelectedCommune(editedOrder.commune)
    }, [editedOrder]);
    
    useEffect(() => {
        // updateWilayat()
    }, []);

    useEffect(() => {
        if(!Products, !wilayat) return
        
        handleShopifyOrders()
    }, [wilayat,Products]);

    if (isLoading || wilayatLoding || communesLoding || ProductsLoding || zrOrdersLoding || LivreurOrdersLoding) return <div>Loading...</div>;
    if (isError || communesIsErr || wilayatErr || ProductsIsError || ZrOrdersIsError|| LivreurOrdersIsError) {
        return <div>Error fetching Data: {
            error?.message ||
            ZrOrdersError?.message ||
            LivreurOrdersError?.message ||
            ProductsErr?.message ||
            wilayatIsErr?.message ||
            communesErr?.message
        }</div>;
    }


    
    async function handleShopifyOrders() {
        let orders = await fetchShopify();
        orders = orders.reverse();
        
        if(!orders || !Array.isArray(orders) || orders.length === 0) return
        
        
     
        const newOrders = orders
            .map(order => transformShopifyOrder(order))
            .filter(Boolean); // Remove null values from the array

        
    
        
        newOrders.forEach(order => {
            queryClient.invalidateQueries('orders');
            
            addOrder(order)
        });
        console.log(newOrders.length)

        if(newOrders.length>0) updateShopifyDate()
    
        
    }

    function extractNoteValue(notes, noteName) {
        // Find the note with the matching name
        const note = notes.find(n => n.name === noteName);
        
        // Return the value of the note or null if not found
        return note ? note.value : null;
    }

    function getWilayaName(wilayaId) {
        if (wilayat && Array.isArray(wilayat)) {
          const wilaya = wilayat.find(item => item.wilaya_id === wilayaId);
          return wilaya ? wilaya.wilaya_name : ''; // Return name if found, else empty string
        }
        return ''; // Default to empty string if wilayat is not available or empty
    }

    function getProductImageOnByTitle(title) {
        if (Products && Array.isArray(Products)) {
          const product = Products.find(item => item.title === title);
          return product ? product.imageOn : null; // Return _id if found, else null
        }
        return null; // Default to null if products is not available or empty
    }

    function getProductIdByTitle(title) {
        if (Products && Array.isArray(Products)) {
          const product = Products.find(item => item.title === title);
          return product ? product._id : null; // Return _id if found, else null
        }
        return null; // Default to null if products is not available or empty
    }

    function getProductCodeByTitle(title) {
        if (Products && Array.isArray(Products)) {
          const product = Products.find(item => item.title === title);
          return product ? product.code : null; // Return _id if found, else null
        }
        return null; // Default to null if products is not available or empty
    }
      
    // Updated transformShopifyOrder function
    function transformShopifyOrder(order) {
       
        // Extract wilaya_id from the Province note (e.g., "25. قسنطينة")
        const provinceNote = extractNoteValue(order.note_attributes, "Province");
        const wilayaId = provinceNote ? parseInt(provinceNote.split('.')[0].trim(), 10) : null;
    
        // Get the wilaya name using the wilaya_id from the order
        const wilayaName = getWilayaName(wilayaId);
    
        // Filter the orders array to remove items without a valid productId
        const orders = order.line_items
            .map(item => {
                const productId = getProductIdByTitle(item.name);
                const productCode = getProductCodeByTitle(item.name);
                const imageOn = getProductImageOnByTitle(item.name);
                return productId ? { 
                    productId, 
                    title: item.name, 
                    imageOn:imageOn,
                    qnt: item.quantity, 
                    code: productCode 
                } : null;
            })
            .filter(Boolean); // Remove null entries
        
        // Return null if the orders array is empty
        if (orders.length === 0) {
            return null;
        }
    
        return {
            DLVTracking: generateUniqueString(9),
            name: `${order.customer.first_name} ${order.customer.last_name || ''}`, // Assuming customer details are available
            adminEmail: order.contact_email || '',
            ip: extractNoteValue(order.note_attributes, "IP ADDRESS"),
            deliveryAgent: 'ZR', // Default value
            blackListed: false, // Default value
            instaUserName: '', // Not provided in Shopify data
            phoneNumber: order.shipping_address?.phone || '',
            wilaya: wilayaName || '', // Use the wilaya name fetched from getWilayaName
            commune: extractNoteValue(order.note_attributes, "Commune") === "None" ? "" : extractNoteValue(order.note_attributes, "Commune") || '', // Handle "None"
            adresse: order.shipping_address?.address1 || '',
            shippingMethod: 'بيت',
            shippingPrice: parseFloat(order.shipping_lines?.[0]?.price || 0),
            suorce: 'shopify',
            totalPrice: parseFloat(order.total_price || 0),
            orders, // Updated orders array
            state: 'غير مؤكدة', // Default value
            schedule: '', // Default value
            deliveryNote: '', // Default value
            inDelivery: false, // Default value
            tracking: 'غير مؤكدة', // Default value
            createdAt: order.created_at,
            note: order.note || '', // General order note
        };
    }
   
    async function updateWilayat() {
        const wilaya = await getWilayas();
        const fees = await getTrafication()
        const commune = await ConvertCommuneToJSON();
        await updateWilayas(wilaya, fees, commune)
        
    }

    
    async function getOrderStatus(order,coli) {            
       

        if(!coli) return
        const ZrStatus = coli.Situation.trim();
        
        if (ZrStatus === 'Reporté') {
            const updated = await addOrderSchedule(order,coli.Commentaire)
        }
        const newTracking = newTrackingFromActivity(order, ZrStatus);            
        
        return newTracking

    }

    function newTrackingFromActivity(order, ZrStatus) {
        let newTracking =ZrStatus

        

        if (ZrStatus === 'SD - Appel sans Réponse 3') {
            newTracking = 'SD - Appel sans Réponse 2'; 
        } else if (ZrStatus === 'SD - En Attente du Client') {
            newTracking = 'En Attente du Client'; 
        } else if (ZrStatus === 'Reporté') {
            newTracking = 'Scheduled ZR'; 
        } else if (ZrStatus === 'En Traitement - Prêt à Expédie') {
            newTracking = 'Prêt à expédier'; 
        }else if ((!order.inDelivery && ZrStatus === 'En Préparation')&&order.tracking !== 'Prêt à expédier') {
            newTracking = 'En Préparation';
        } 

        if(newTracking === 'Retour Navette' && order.tracking !== 'Retour Navette') {
            
            order.orders.forEach(product => {
    
                product?.qnts?.forEach(qnt => {
                    editAddProduct(product.productID,qnt)
                })
            });
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

        
        if(name === 'state' && value === 'مؤكدة') {
            setDeliveryAgentSlection(true)
        }
        
        if(name === 'state' && (editedOrder.tracking === 'غير مؤكدة' || 
            editedOrder.tracking === 'ملغاة' || 
            editedOrder.tracking === '1 لم يرد' ||
            editedOrder.tracking === '2 لم يرد' ||
            editedOrder.tracking === '3 لم يرد' ||
            editedOrder.tracking === 'لم يرد' 
        )) {
          
            setEditedOrder(prev => ({
                ...prev,
                tracking: value,
                [name]: value
            }));
            return
        }
        


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
            tracking: 'Scheduled'

        }));
    }

    async function handleDelete(id) {

        const order = Orders.find(order => order._id === id)
        const emailAllowed = await checkEmailAllowance(order._id)
        if(!emailAllowed){
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }

        setDeleting(pre => ([...pre, {
            id: id,
            state: true
        }]))
        setEditedOrderId('')
        await deleteOrder(id)
        setSuccessNotifiction('تم حذف الطلب بنجاح')
        router.refresh()
        router.push('/admin/orders')
        queryClient.invalidateQueries(`orders,${dateFilter}`);
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

    async function addToZR(order) {
        
        const emailAllowed = await checkEmailAllowance(order._id)
        if(!emailAllowed){
            
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }

        if(!order.name||!order.phoneNumber||!order.adresse||!order.commune){
            setErrorNotifiction("couldn't set the order in ZR")
            return 
        }
        
        const wilayatresponse = await axios.get('/api/wilayas/wilayasCodes');
        const wilayat = wilayatresponse.data.wilayas; // Get the data from the response

        const wilayaCode =wilayat.find(wilaya=>wilaya.wilaya_name === order.wilaya).wilaya_id
        
               
        let products =[]

        order.orders.forEach(order=>{
            const i =products.findIndex(product=>product === order.title)
            if(i === -1){
                if(!order.code){
                    products.push(order.title)
                }else{
                    products.push(order.code)
                }
            }
        })


        const ZROrder ={
            Tracking:order.DLVTracking,
            TypeLivraison:order.shippingMethod === 'مكتب' ? 1 : 0,
            TypeColis:0,
            Confrimee:'',
            Client:order.name,
            MobileA:order.phoneNumber,
            MobileB:'',
            Adresse:order.adresse,
            IDWilaya:wilayaCode,
            Commune:order.commune,
            Total:order.totalPrice,
            Note:order.deliveryNote,
            TProduit:products.join(),
            id_Externe:order._id,
            Source:''
        }

     

        try {
            await addOrderToZR(ZROrder)
        } catch (error) {
            setErrorNotifiction("couldn't set the order in ZR")
            setEditedOrder(pre=>{
                return {...pre, state: 'غير مؤكدة'}
            })
            console.error('Error:', error.response?.data || error.message);
        }
    }

    async function validateToZR(order) {
        const emailAllowed = await checkEmailAllowance(order._id)
        if(!emailAllowed){
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }
       
        try {
            expedieOrderToZR(order.DLVTracking)
            const newOrder = {
                ...order,
                inDelivery: true,
                tracking: 'Prêt à expédier',
            };
            const response = await axios.put(`/api/orders/${order._id}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
            queryClient.invalidateQueries(`orders,${dateFilter}`);
        } catch (error) {
            setErrorNotifiction("couldn't validate the order in ZR");
            console.error('Error:', error.response?.data || error.message);
        }
        
    }
    
    async function validateMultibelToZR(orders){
        orders.forEach(async(order) => {
            
        
            let res = await validateToZR(order)
         
            
            
            const newOrder = {
                ...order,
                inDelivery: true,
                tracking: 'Prêt à expédier',
            };
            const response = await axios.put(`/api/orders/${order._id}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
            queryClient.invalidateQueries(`orders,${dateFilter}`);
        })
    }

    async function handelConfirmOrder(order) {
        let success = true;
        const emailAllowed = await checkEmailAllowance(order._id)
        if(!emailAllowed){
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }
    
        for (const item of order.orders) {
            if (!success) break;
           
            const res = await editMinusProduct(item.productID, item.qnt, 'confirmed order',null,item.title);
          
            if (res.success) {
                item.qnts = res.removedItems;
            } else {
                success = false;
            }
        }
    
        if (success) {
            return { success: true, order: order };
        }
        
        return { success: false };
    }

    async function handleUpdatingOrder(id) {
        // setEditedOrder(pre => ({ ...pre, orders: newOrders }))
        setSaving(pre => ([...pre, id]))
        const oldOrder = Orders.find(order => order._id === id)

        // if(oldOrder.tracking !== 'delivered' && editedOrder.tracking === 'delivered'){
        //     ordersQnts.forEach(order=>{
        //         editMinusProduct(order.title,order.qnt)
        //     })
        // }


        let newOrder = editedOrder
        if(oldOrder.state !== 'مؤكدة' && editedOrder.state  === 'مؤكدة' && editedOrder.deliveryAgent === 'ZR'){
            if(!editedOrder.wilaya || !editedOrder.commune || !editedOrder.adresse){
                setIsProductDeleted([])
                setSelectedDate(null)
                setSaving(pre => {
                    const nweSaving = pre.filter(SId => SId !== id)
                    return nweSaving
                })
                return setErrorNotifiction("ادخل كل المعلومات اللازمة")
            }
            
            const res = await handelConfirmOrder(editedOrder)

            if(res.success){
                await addToZR(editedOrder)
                newOrder = {
                    ...res.order,
                    tracking : 'En Préparation'
                }
            }
            if(!res.success){
                setIsProductDeleted([])
                setSelectedDate(null)
                setSaving(pre => {
                    const nweSaving = pre.filter(SId => SId !== id)
                    return nweSaving
                })
                return setErrorNotifiction("Not enough items in stock")
            }
        }

        if(oldOrder.inDelivery !== true && editedOrder.inDelivery  === true && editedOrder.deliveryAgent !== 'Livreur'){
            newOrder = {
                ...newOrder,
                tracking : 'Prêt à expédier L'
            }
        }
        
        
       

        if(oldOrder.inDelivery !== true && editedOrder.inDelivery  === true && editedOrder.deliveryAgent === 'ZR' && editedOrder.state  === 'مؤكدة'){
            let res= await validateToZR(editedOrder)
            newOrder = {
                ...newOrder,
                tracking : 'Prêt à expédier'
            }
        }

        if(oldOrder.inDelivery !== true && editedOrder.inDelivery  === true && editedOrder.deliveryAgent === 'Livreur' && editedOrder.state  === 'مؤكدة'){
            newOrder = {
                ...newOrder,
                tracking : 'Prêt à expédier L',
                inDelivery : true
            }
        }

        const emailAllowed = await checkEmailAllowance(oldOrder._id)
        if(!emailAllowed){
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }

        if(editedOrder.deliveryAgent === 'Livreur' && oldOrder.state !== 'مؤكدة'){
            newOrder = {
                ...newOrder,
                tracking : 'En Préparation'
            }
        }

        newOrder = {
            ...newOrder,
            deliveryAgent: editedOrder.deliveryAgent
        }

        

        const res = await axios.put(`/api/orders/${editedOrderId}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
        if(res.data.success){
            setSuccessNotifiction('تم تعديل الطلب بنجاح');
        }else{
            setErrorNotifiction(res.data.message);
            router.refresh()
            router.push('/admin/orders')
        }
        queryClient.invalidateQueries(`orders,${dateFilter}`);

        setDeliveryAgentSlection(false)
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
        
            let res = await addToZR(order)
            tracking = res?.tracking
            
            
            const newOrder = {
                ...order,
                state: 'مؤكدة',
                tracking : 'En Préparation',
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
            order.name?.toLowerCase().includes(searchLower) ||
            order.wilaya?.toLowerCase().includes(searchLower) ||
            order.phoneNumber.includes(searchLower) ||
            order.DLVTracking?.toLowerCase().includes(searchLower) ||
            order.adresse?.toLowerCase().includes(searchLower)
        );

        let isMatchingTraking
        

        // if(trackingFilter ==='Scheduled'){
        //     isMatchingTraking = order.schedule === currentDate;

        // }else 
        
        if(trackingFilter === 'Abandoned'){
            isMatchingTraking = order.state === 'abandoned'
        }else{
            isMatchingTraking = order.tracking === trackingFilter
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

    const productsOptionsElent = Products.map(products => {
        if (products.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
            return (
                <div
                    key={products._id}
                    className='flex p-4 z-50 border-gray-500 border-b-2 w-full items-center justify-between bg-white'
                    onClick={(e) => {
                        handleProductChange(products, product._id)
                        setSelectedImage({
                                _id: product._id,
                                image: products.imageOn
                            })
                            setIsproducts({ _id: '', state: false })
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
   
    function addProductsOptionsElent(id) {
        return Products.map(product => {
            if (product.title.toLowerCase().includes(search.toLocaleLowerCase()) || search === '') {
                return (
                    <div
                        key={product._id}
                        className='flex p-4 z-50 border-gray-500 border-b-2 w-full items-center justify-between bg-white'
                        onClick={(e) => {
                            setAddedOrder(pre => {
                                return { ...product, image: product.imageOn }
                            })                          
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
                    productID: addedOrder._id
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

    const ordersElementFun = (product, i, order ,newOrderslength) => {

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
                colSpan={longesOrder.length/newOrderslength}
                className=" border-y bg-blue-100 border-solid border-[rgba(0, 40, 100, 0.12)] relative font-medium p-2 pr-4 text-center h-8"
            >
               {order._id !== editedOrderId &&
                <div 
                    className="absolute top-0 right-0 size-full"
                    onMouseOver={()=>setIsGallery(pre=>[...pre, product._id])}
                    onMouseOut={()=>setIsGallery(pre=>pre.filter(item => item !== product._id))}
                >
                    
                    {(isGallery.includes(product._id) && galleryElement) &&
                        <div 
                            className="absolute z-50 -bottom-28 right-0 flex bg-gray-200 shadow-lg rounded-md rounded-tr-none gap-2 p-6 w-max"
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

                {(order._id === editedOrderId && optionElement?.length > 0)
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

                {(order._id === editedOrderId && order.state  !== 'مؤكدة') &&
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
                    <div className='max-w-96 border border-solid border-[rgba(0, 40, 100, 0.12)]  absolute mt-2 bg-white z-[102]'>
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
                        <div
                            className='max-h-[484px] w-80 z-50 overflow-y-auto'
                        >
                            {productsOptionsElent}
                        </div>
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
                        className="bg-red-500 absolute right-1 top-1 rounded-lg px-1 text-[10px] text-white text-center"
                    >
                        {product.qnt}
                    </span>
                }
                {(order._id === editedOrderId && i === newOrderslength-1) &&
                    <FontAwesomeIcon
                        icon={faPlus}
                        className='cursor-pointer'
                        onClick={() => toggleIsAding(order._id)}
                    />
                }
                        
                {(isAddingProduct.includes(order._id) && i === newOrderslength-1) &&
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
                                            <div
                                                className='max-h-[484px] w-80 z-50 overflow-y-auto'
                                            >
                                                {addProductsOptionsElent(order._id)}
                                            </div>
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
                            onClick={()=>{
                                addToOrders()
                                toggleIsAding(order._id)
                            }}
                        >
                            Add
                        </button>

                    </div>
                }
            </td>
        )
    }

    function trackingBg(track){
        if(track === 'Retour de Dispatche' || track === 'Retour Navette' || track === 'Retour Livreur'){
            return redBg
        }
        if(track === 'En livraison' || track === 'En Attente du Client'){
            return lightGreenBg
        }
        if(track === 'Appel sans Réponse 3' || track === 'Appel sans Réponse 2' || track === 'Appel sans Réponse 1' || track === 'SD - Appel sans Réponse 2' || track === 'SD - Appel sans Réponse 1' || track === 'SD - Annuler par le Client' || track === 'Annuler par le Client'){
            return yellowBg
        }
        if(track === 'En Préparation' || track === 'Dispatcher'){
            return darkBlueBg
        }
        if(track === 'Livrée' || track === 'Livrée [ Encaisser ]'){
            return greenBg
        }
        if(track === 'Prêt à expédier' || track === 'Scheduled' || track === 'Scheduled ZR'){
            return orangeBg
        }
        if(track === 'Au Bureau'){
            return lightBlueBg
        }
        if(track === 'A Relancé'){
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
        if(state === 'لم يرد' ||
            state === '1 لم يرد' ||
            state === '2 لم يرد' ||
            state=== '3 لم يرد' 
        ){
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
    function handleSelecteAllOrders() {
        const currentDate = format(new Date(), 'yyyy-MM-dd');
        Orders.forEach(order => {
            if(!filterOrders(order, currentDate)) return
            
            setSelectedOrders(pre=>{
                if(pre.some(item => item._id === order._id)){
                    return pre.filter(item => item._id !== order._id)
                }
                return [...pre, order]
            })
        })
    }

    async function handleSendMessage() {
        selectedOrders.forEach(async (order) => {
            // const res = await sandMessage(order.instaUserName, instaMessage)
            
        })
    }

    async function handleAddToBlackList(order) {
        const emailAllowed = await checkEmailAllowance(order._id)
        if(!emailAllowed){
            setErrorNotifiction('You are not allowed to edit this order')
            setEditedOrder({})
            queryClient.invalidateQueries(`orders,${dateFilter}`);
            return
        }
        
        try{
            addToBlackList(order.ip,order.phoneNumber)
            const newOrder = { ...order, blackListed: true }
            const res = axios.put(`/api/orders/${order._id}`, newOrder, { headers: { 'Content-Type': 'application/json' } });
            setSuccessNotifiction('IP added to blacklist successfully')
            queryClient.invalidateQueries(`orders,${dateFilter}`);
        }catch(err){
            console.log(err.message)
            setErrorNotifiction('An error occurred. Please try again later.')
        }

    }

    const wilayasOptionsElement = wilayat.map(wilaya => {
        if(!wilaya.wilaya_name.toLowerCase().includes(wilayaSearch.toLowerCase()) && wilayaSearch !== '') return
        return(
            <div
            key={wilaya.wilaya_name}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => {
                setEditedOrder(pre=>({...pre,wilaya:wilaya.wilaya_name}));
                setSelectedWilaya(wilaya.wilaya_name);
                setIsWilayaDropdown(false);
                setWilayaSearch(""); // Reset search after selection
            }}
        >
            {wilaya.wilaya_name}
        </div>
        )
    })

    const wilayatElemnt =[
        <div key={'wilayatElemnt'} className="flex w-full relative rounded-md border border-[rgba(0, 40, 100, 0.12)]">
            <div
                className="w-full items-center flex bg-transparent rounded cursor-pointer"
                onClick={() => setIsWilayaDropdown(pre=>!pre)}
            >
                <div className="px-2 flex items-center justify-between w-full">
                    {selectedWilaya}
                    <FontAwesomeIcon icon={faChevronDown} className={`text-sm`} />
                </div>
            </div>
            {isWilayaDropdown&& (
                <div className="absolute w-max bg-white border border-[rgba(0, 40, 100, 0.12)] rounded shadow-lg z-10">
                    <div className="flex items-center pr-2 w-full bg-white border border-[rgba(0, 40, 100, 0.12)]">
                        <input
                            type="text"
                            value={wilayaSearch}
                            onChange={(e) => setWilayaSearch(e.target.value)}
                            placeholder="ابحث عن الولاية"
                            className="flex-grow no-focus-outline p-2"
                        />
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`text-sm rotate-180 cursor-pointer`} 
                            onClick={()=>setIsWilayaDropdown(false)}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {wilayasOptionsElement}
                    </div>
                </div>
            )}
        </div>
    ]

    const communesOptionsElement = slectedCommunes.map(commune => {
        if(!commune.nom.toLowerCase().includes(communeSearch.toLowerCase()) && communeSearch !== '') return
        return(
            <div
            key={commune.nom}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            onClick={() => {
                setEditedOrder(prev=>({...prev,commune:commune.nom}));
                setSelectedCommune(commune.nom);
                setIsCommuneDropdown(false);
                setCommuneSearch(""); // Reset search after selection
            }}
        >
            {commune.nom}
        </div>
        )
    })

    const communesElemnt =[
        <div key={'communesElemnt'} className="flex w-full relative rounded-md border border-[rgba(0, 40, 100, 0.12)]">
            <div
                className="w-full items-center flex bg-transparent rounded cursor-pointer"
                onClick={() => setIsCommuneDropdown(pre=>!pre)}
            >
                <div className="px-2 flex items-center justify-between w-full">
                    {selectedCommune}
                    <FontAwesomeIcon icon={faChevronDown} className={`text-sm`} />
                </div>
            </div>
            {(isCommuneDropdown && selectedWilaya !== 'الولاية')&& (
                <div className="absolute w-max bg-white border border-[rgba(0, 40, 100, 0.12)] rounded shadow-lg z-10">
                    <div className="flex items-center pr-2 w-full bg-white border border-[rgba(0, 40, 100, 0.12)]">
                        <input
                            type="text"
                            value={communeSearch}
                            onChange={(e) => setCommuneSearch(e.target.value)}
                            placeholder="ابحث في الولاية"
                            className="flex-grow no-focus-outline p-2"
                        />
                        <FontAwesomeIcon 
                            icon={faChevronDown} 
                            className={`text-sm rotate-180 cursor-pointer`} 
                            onClick={()=>setIsCommuneDropdown(false)}
                        />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {communesOptionsElement}
                    </div>
                </div>
            )}
        </div>
    ]

    const allDelevryAgents =[
        'ZR',
        'Livreur',
    ]
    const allDelevryAgentsOptionsElement = allDelevryAgents.map(agent => {
        return(
            <option
            key={agent}
            className="p-2 hover:bg-gray-200 cursor-pointer"
            >
                {agent}
            </option>
        )
    })


    function ordersElement(data){

        return data.map((order, index) => {
            
            const currentDate = format(new Date(), 'yyyy-MM-dd');
            if (filterOrders(order, currentDate) || reaserchedOrders.length > 0) {
                let cartItemsElemnt
                if (order.orders) {
                    cartItemsElemnt = order.orders.map((product, i) => ordersElementFun(product, i, order,order.orders.length))
    
                    if (editedOrderId === order._id && Array.isArray(newOrders)) {
                        cartItemsElemnt = newOrders.map((product, i) => ordersElementFun(product, i, order,newOrders.length))
                    }
                }
                if (editedOrderId === order._id) {
                    return (
                        <tr key={order._id} className={`h-5  ${order.blackListed && 'bg-red-200'}`}>
                            <td>
                                {(!order.blackListed && isIpBlockAccess) &&
                                <button
                                    className=' p-2 rounded-md'
                                    onClick={() => {
                                        setMessageOrder(order)
                                        setMessage('Blacklist')
                                        setIsMessage(true)

                                    }}
                                >
                                    <FontAwesomeIcon 
                                        icon={faBan} 
                                        className="text-red-700" 
                                    />
                                </button> 
                                }
    
                                {isDeleteAccess && deleting.some(item => item.id === order._id && item.state) &&
                                    <Spinner size={'h-8 w-8'} color={'border-red-500'} containerStyle={'ml-6 -mt-3'} />
                                }  
                                {isDeleteAccess && !deleting.some(item => item.id === order._id && item.state) &&
                                    <button
                                        className=' p-2 rounded-md'
                                        onClick={() => {
                                            setMessageOrder(order)
                                            setMessage('Delete')
                                            setIsMessage(true)
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrashCan} className="text-red-700" />
                                    </button>                            
                                }  
    
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
                            {cartItemsElemnt}
                            <td className="bg-blue-100">
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.name}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="name"
                                    defaultValue={editedOrder.name}
                                    className='border min-w-full bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                              }
                            </td>
                            <td className="bg-blue-100">
                             {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.phoneNumber}</div>
                                :<input
                                    type='text'
                                    onChange={handleChange}
                                    name="phoneNumber"
                                    defaultValue={editedOrder.phoneNumber}
                                    className='border min-w-full bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width '
                                />
                             }
                            </td>
                            <td className="bg-blue-100">
                               {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.wilaya}</div>
                                :wilayatElemnt
                                }
                            </td>
                            <td className="bg-blue-100">
                               {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.commune}</div>
                                :communesElemnt
                               }
                            </td>
                            <td className="bg-blue-100">
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.adresse}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="adresse"
                                    value={editedOrder.adresse}
                                    className='border min-w-full bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                              }
                            </td>
                            <td className="bg-gray-200">
                                {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
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
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.shippingPrice}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="shippingPrice"
                                    defaultValue={editedOrder.shippingPrice}
                                    className='border min-w-full bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                              }
                            </td>
                            <td className="bg-gray-200">
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.totalPrice}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="totalPrice"
                                    defaultValue={editedOrder.totalPrice}
                                    className='border min-w-full bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                              }
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
                               {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.state}</div>
                                :<div>
                                    {deliveryAgentSlection?
                                        <div>
                                            <select 
                                                name="deliveryAgent" 

                                                className="w-full border bg-inherit z-10 border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1"
                                                value={editedOrder.deliveryAgent}
                                                onChange={(e) =>{
                                                    setDeliveryAgent(e.target.value)
                                                    handleChange(e)
                                                }}
                                            >
                                                <option hidden>طريقة التوصيل</option>
                                                {allDelevryAgentsOptionsElement}
                                            </select>
                                        </div>
                                    :
                                    <select
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
                                        value="1 لم يرد"
                                        className="bg-orange-300"
                                    >
                                        1 لم يرد
                                    </option>
                                    <option 
                                        value="2 لم يرد"
                                        className="bg-orange-300"
                                    >
                                        2 لم يرد
                                    </option>
                                    <option 
                                        value="3 لم يرد"
                                        className="bg-orange-300"
                                    >
                                        3 لم يرد
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
                                </div>
                            }
                            </td>
                            <td>
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.schedule}</div>
                                :<DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                    dateFormat="yyyy-MM-dd"
                                />
                              }
                            </td>
                            <td>
                              {order.state  === 'مؤكدة' && order.state  !== 'abandoned' && superEdit === true
                                ?<div>{editedOrder.deliveryNote}</div>
                                :<input
                                    type="text"
                                    onChange={handleChange}
                                    name="deliveryNote"
                                    defaultValue={editedOrder.deliveryNote}
                                    className='border bg-transparent border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1 dynamic-width'
                                />
                              }
                            </td>
                            <td className="text-center">
                                {(order.state === 'مؤكدة' && !editedOrder.inDelivery) 
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
                                {order.state  === 'مؤكدة'
                                ? <select 
                                    name="tracking" 
                                    className="w-full border bg-inherit z-10 border-[rgba(0, 40, 100, 0.12)] rounded-md pl-1"
                                    value={editedOrder.tracking}
                                    onChange={handleChange}
                                >
                                    <option hidden>تتبع</option>
                                    <option value="Livrée">Livrée</option>
                                    <option value="Livrée [ Recouvert ]">Livrée [ Recouvert ]</option>
                                    <option value="Retour Navette">Retour Navette</option>
                                    <option value="Retour de Dispatche">Retour de Dispatche</option>
                                </select>
                                :<div>{editedOrder.tracking} : {editedOrder.deliveryAgent}</div>
                                }
                            </td>
                            {/* <td>
                            
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
                                                        <div
                                                            className='max-h-[484px] w-80 z-50 overflow-y-auto'
                                                        >
                                                            {addProductsOptionsElent(order._id)}
                                                        </div>
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
                            </td> */}
                            <td className="">
                                {order.createdAt}
                            </td>
                        </tr>
                    )
                } else {
                    return (
                        <tr
                            key={order._id}
                            className={`h-5 ${saving.includes(order._id) && 'opacity-40'} ${deleting.some(item => item.id === order._id && item.state) && 'opacity-40'}`}
                        >
                            {(isUpdateAccess || isDeleteAccess || isCrafting || isExcel || isOrderAction) && (
                                <td className={` ${order.blackListed && 'bg-red-200'}`}>
                                    
                                    {saving.includes(order._id)
                                        ?
                                        <Spinner size={'w-8 h-8'} color={'border-green-500'} containerStyle={'ml-6 -mt-3'} />
                                        :
                                        <div className=" whitespace-nowrap flex items-center justify-center">
                                            
                                            
                                            {(isCrafting || isSending ||(isExcel && order?.DLVTracking)||isOrderAction) &&
                                                <div className="p-2 flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="size-4 m-0"
                                                        checked={selectedOrders.some(item => item._id === order._id)}
                                                        onChange={(e) => handleSelecteOrder(order)} 
                                                    />
                                                </div>
                                            }

                                            {(!order.blackListed && isIpBlockAccess) &&
                                            <button
                                                className=' p-2 rounded-md'
                                                onClick={() =>{
                                                    setMessageOrder(order)
                                                    setMessage('Blacklist')
                                                    setIsMessage(true)
                                                }}
                                            >
                                                <FontAwesomeIcon 
                                                    icon={faBan} 
                                                    className="text-red-700" 
                                                />
                                            </button> 
                                            }
                                            {isDeleteAccess && deleting.some(item => item.id === order._id && item.state) &&
                                                <Spinner size={'h-8 w-8'} color={'border-red-500'} containerStyle={'ml-6 -mt-3'} />
                                            }  
                                            {isDeleteAccess && !deleting.some(item => item.id === order._id && item.state) &&
                                                <button
                                                    className=' p-2 rounded-md'
                                                    onClick={() => {
                                                        setMessageOrder(order)
                                                        setMessage('Delete')
                                                        setIsMessage(true)
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} className="text-red-700" />
                                                </button>                            
                                            }  
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
                            {cartItemsElemnt}
                            <td className="bg-blue-100 relative  max-w-36 whitespace-nowrap overflow-hidden text-ellipsis hover:overflow-visible group">
                                <div className="overflow-hidden text-ellipsis">
                                    {order.name}
                                </div>
                                <div className="absolute top-0 left-0 mt-2 w-max max-w-xs p-2 bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {order.name}
                                </div>
                            </td>
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
                                    {order.tracking} : {order?.deliveryAgent}
                                </div>
                                <Image 
                                    src={trackingBg(order.tracking)} 
                                    alt='' 
                                    width={64} height={64} 
                                    className='absolute opacity-50 top-1/2 right-3 w-3/4 -translate-y-1/2'
                                />
                            </td>
                            <td className="">
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
    
    const generateOrdersExcel = async (data) => {
        if(!data || data.length === 0 ) return setErrorNotifiction(`select orders to generate excel`)
    
        // Map the data to the desired Excel format
        const formattedData = data.map(order => ({
            'Tracking': order.DLVTracking,
            'الاسم': order.name,
            'الهاتف': order.phoneNumber,
            'الولاية': order.wilaya,
            'البلدية': order.commune,
            'العنوان': order.adresse,
            'طريقة التوصيل': order.shippingMethod,
            'سعر التوصيل': order.shippingPrice,
            'السعر الكلي': order.totalPrice,
            'الحالة': order.state,
            'التتبع': order.tracking,
            'في التوصيل': order.inDelivery ? 'نعم' : 'لا',
            'تاريخ الانشاء': new Date(order.createdAt).toLocaleString(),
            'محظور': order.blackListed ? 'نعم' : 'لا',
        }));
    
        // Create a new workbook and add a worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(formattedData);
    
        // Calculate the max width for each column and set the column widths
        const getMaxWidth = (arr, key) => Math.max(...arr.map(obj => obj[key]?.toString().length || 0), key.length);
    
        const columns = Object.keys(formattedData[0]).map(key => ({
            wch: getMaxWidth(formattedData, key) + 2 // Add some padding
        }));
    
        ws['!cols'] = columns;
    
        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
    
        // Write the workbook to a file
        const fileName = 'orders.xlsx';
        XLSX.writeFile(wb, fileName);
    
        console.log(`Excel file generated: ${fileName}`);
    };
    
    
    const trackingFiltersArray=[
        {
            name:'Abandoned',
            icon:'abandoned.svg'
                      
        },{
            name:'unconfirmed',
            icon:'not confirmed.png' ,
            dropDown:[
                'غير مؤكدة',
                '1 لم يرد',
                '2 لم يرد',
                '3 لم يرد',
                'لم يرد',
                'ملغاة',,
            ]  
        },{
            name:'Scheduled',
            icon:'Schedule.png'      
        },{
            name:'Prêt à expédier L',
            icon:'Prêt à expédier.png'      
        },{
            name:'En Préparation',
            icon:'EnPréparation.png'  
        },{
            name:'Prêt à expédier',
            icon:'Prêt à expédier.png'      
        },{
        
            name:'Scheduled ZR',
            icon:'Schedule.png' 
        },{
            name:'Dispatcher',
            icon:'Dispatcher.png'
        },{
            name:'Au Bureau',
            icon:'Au Bureau.png'      
        },{
            name:'En Attente du Client',
            icon:'En-Attente-du-Client.png'      
        },{
            name:"Didn't respond",
            icon:'Appel sans Réponse.png',
            dropDown:[
                'SD - Appel sans Réponse 1',
                'SD - Appel sans Réponse 2',
                'Appel sans Réponse 1',
                'Appel sans Réponse 2',
                'Appel sans Réponse 3',
            ]        
        },{
            name:'Annuler par le Client',
            icon:'Annuler-par-le-Client.png',
            dropDown:[
                'Annuler par le Client',
                'SD - Annuler par le Client'
            ]            
        },{
            name:'En livraison',
            icon:'En livraison.png'          
        // },{
        //     name:'Suspendus',
        //     icon:'Suspendus.png'          
        },{
            name:'A Relancé',
            icon:'A Relancé.png'          
                  
        },{
            name:'Livrée',
            icon:'livres.png',
            dropDown:[
                'Livrée',
                'Livrée [ Encaisser ]',
                'Livrée [ Recouvert ]'
            ]           
        },{
            name:'returned',
            icon:'returns.png',
            dropDown:[
                'Retour Livreur',
                'Retour Navette',
                'Retour de Dispatche',
                'Retour Client'
            ]         
        }
    ]

    const trackingFiltersEle=trackingFiltersArray.map((filter,i)=>{
        const {name,icon} = filter
        let ordersNumber = 0
        // if(name ==='Scheduled'){
        //     Orders?.forEach(order => {
        //         const currentDate = format(new Date(), 'yyyy-MM-dd');
    
        //         // Check if the saved date is the same as today
        //         const isSameAsToday = order.schedule === currentDate;
        //         if (isSameAsToday) ordersNumber++
        //     })
        // }else 
        if(name ==='unconfirmed'){
            ordersNumber = Orders.filter(order=>(order.state !== 'مؤكدة' && order.state !== 'abandoned' && order.tracking !== 'Scheduled')).length
        }else if(name ==='Abandoned'){
            ordersNumber = Orders.filter(order=>order.state === 'abandoned').length
        }else{
            
            if(!filter.dropDown) ordersNumber = Orders.filter(order=>order.tracking===name).length
            filter.dropDown?.forEach(dropDown=>{
                ordersNumber += Orders.filter(order=>order.tracking===dropDown).length
            })
        }

        const dropDownEle=filter.dropDown?.map((dropDown,i)=>{
            let ordersNumber = Orders.filter(order=>order.tracking===dropDown).length
            return(
                <div 
                    key={dropDown}
                    className={`cursor-pointer flex gap-2 px-4 py-3 ${i !== 0 && ' border-t'} border-gray-400 items-center hover:bg-[#057588] text-black bg-[#fff] hover:text-[#fff]`}
                    onClick={()=>{
                        setTrackingFilter(dropDown)
                        setIsSearching(false)
                        setReaserchedOrders([])
                        setIsTrakingFilterDrop('')
                        setEditedOrderId('')
                        setEditedOrder({})
                    }}
                >
                    <p className="text-sm whitespace-nowrap ">{dropDown}</p>

                    {ordersNumber>0  &&
                    <p 
                        className='bg-[#777] text-xs font-semibold text-[#fff]  px-1 rounded-sm'
                    >
                        {ordersNumber}
                    </p>
                }
                </div>
            )
        })

        return(
            <div 
                key={name}
                className={`cursor-pointer relative flex ${i === 0 ? '' : 'border-l'} ${name !== 'Abandoned' ? 'px-4' : 'pl-4 pr-8'} py-3 border-gray-400 items-center ${trackingFilter === name ? 'bg-[#057588] text-[#fff] ' : ' hover:bg-[#057588] bg-[#fff] hover:text-[#fff]'} gap-2`}
                onClick={()=>{
                    if(filter.dropDown){
                        if(isTrakingFilterDrop === name){
                            setIsTrakingFilterDrop('')
                        }else{
                            setIsTrakingFilterDrop(name)
                        }
                    }else{
                        setTrackingFilter(name)
                        setIsSearching(false)
                        setReaserchedOrders([])
                        setEditedOrderId('')
                        setAddedOrder({})

                    }
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
                {filter.dropDown &&
                    <FontAwesomeIcon
                        icon={faAngleDown}
                        className={`text-xs ${isTrakingFilterDrop === name && 'rotate-180'}`}
                    />
                }
                {isTrakingFilterDrop === name &&
                    <div className="absolute top-11 right-0 z-[100] border border-gray-400 rounded">
                        {dropDownEle}
                    </div>
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
    const thArray = [
        { className: "bg-blue-100", content: "Ref" },
        { className: "bg-blue-100", content: "الأسم" },
        { className: "bg-blue-100", content: "الرقم" },
        { className: "bg-blue-100", content: "الولاية" },
        { className: "bg-blue-100", content: "البلدية" },
        { className: "bg-blue-100", content: "عنوان" },
        { className: "bg-gray-200", content: "نوع التوصيل" },
        { className: "bg-gray-200", content: "سعر التوصيل" },
        { className: "bg-gray-200", content: "سعر كلي" },
        { className: "bg-gray-200", content: "ملاحضة" },
        { className: "bg-gray-200", content: "الحالة" },
        { className: "", content: "التأجيل" },
        { className: "", content: "ملاحظة التوصيل" },
        { className: "", content: "في التوصيل" },
        { className: "", content: "التتبع" },
        { className: "", content: "التاريخ" },
    ];
    
    const thElement = thArray.map((th, i) => (
        <th key={i} className={th.className}>
            <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                {th.content}
            </div>
        </th>
    ));
    
    return (
        <div className="relative pl-4 pr-48 flex flex-col gap-5 h-screen overflow-x-scroll w-full min-w-max">

            <div 
                className={`bg-green-200 transition-all duration-200 flex items-center gap-2 fixed top-16 right-6 z-[101] border border-gray-400 px-4 py-2 rounded 
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
                className={`bg-red-200 transition-all duration-200 flex items-center gap-2 fixed top-16 right-6 z-[102] border border-gray-400 px-4 py-2 rounded 
                            ${errorNotifiction ? 'translate-x-0 opacity-100' : 'translate-x-96 opacity-0'}
                          `}
            >
                <FontAwesomeIcon 
                    icon={faX} 
                    className={`text-white bg-red-500 p-1 text-xs rounded-full`} 
                />
                {errorNotifiction}
            </div>

            {isMessage &&
            <div 
                className="flex flex-col gap-4 items-center justify-center p-16 rounded-lg fixed top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-1/3 h-1/2 aspect-square z-[250] bg-[#f5f5f5]"
            >
                <div className="bg-red-200 rounded-full p-4">
                <FontAwesomeIcon 
                    icon={faTriangleExclamation} 
                    className="text-red-500 text-5xl"
                />
                </div>
                <h1 className="text-3xl font-bold mb-4">Are you sure?</h1>
                <p className="text-lg text-center">Do you relly want to {message} this order? This process cannot be undone</p>
                <button 
                    className="rounded-md font-medium border border-red-600 bg-red-600 text-white px-4 py-2 w-full"
                    onClick={()=>{
                        if(message === 'Delete') {
                            handleDelete(messageOrder._id)
                            setMessageOrder({})
                            setMessage('')
                            setIsMessage(false)
                        }else{
                            handleAddToBlackList(messageOrder)
                            setMessageOrder({})
                            setMessage('')
                            setIsMessage(false)
                        }
                    }}
                >
                    {message} the order
                </button>
                <button 
                    className="rounded-md font-medium border border-gray-600 px-4 py-2 w-full"
                    onClick={()=>{
                        setMessageOrder({})
                        setMessage('')
                        setIsMessage(false)
                    }}
                >
                    Cancel
                </button>
            </div>}

            {isMessage &&
            <div 
                className="fixed backdrop-filter backdrop-blur-sm bg-[#0000004f] top-0 right-0 w-screen aspect-square z-[249]"
                onClick={()=>{
                    setMessageOrder({})
                    setMessage('')
                    setIsMessage(false)
                }}
            ></div>}

            <div className="w-ful h-11 -ml-4 shadow-md flex">
                {trackingFiltersEle}
                <div 
                    className={`cursor-pointer flex px-4 py-3 border-l border-gray-400 items-center ${isSearching ? 'bg-[#057588] text-[#fff] ' : ' hover:bg-[#057588] bg-[#fff] hover:text-[#fff]'} gap-2`}
                    onClick={() =>{
                        setIsSearching(pre=>!pre)
                        setTrackingFilter('')
                        setEditedOrder({})
                        setEditedOrderId('')
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

                {isUpdateAccess &&
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
                            className="absolute rounded-lg top-12 right-1/2 translate-x-1/2 border z-[100] border-gray-500 flex flex-col bg-white items-center"
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
                                    validateMultibelToZR(selectedOrders,0)
                                    setIsOrderAction(pre=>!pre)
                                }}
                            >
                                Expedie To ZR
                            </div>
                        </div>}
                    </div>
                }
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

                { isExcelAccess && 
                    <div
                        className='relative h-11 min-w-28 whitespace-nowrap justify-self-end border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                        onClick={() => {
                            if(isExcel) {
                                setisExcel(pre => !pre)
                                generateOrdersExcel(selectedOrders)
                                setSelectedOrders([])
                            }else{
                                setisExcel(pre => !pre)
                            }
                        }}
                    >
                        {lablesLoading && 
                            <Spinner size={'size-6'} containerStyle={'ml-8'} />
                        }
                        {(isExcel && !lablesLoading) && 'Show excel' }
                        {(!isExcel && !lablesLoading) && 'upload to excel' }
                    </div>
                }

                <select
                    name="date"
                    onChange={handleDateFilterChange}
                    className="ml-auto capitalize border-gray-500 border p-2 px-4 rounded-xl cursor-pointer"
                >
                    {dateFilterElements}
                </select>

                <Link
                    className='justify-self-end  whitespace-nowrap border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                    href={'/admin/orders/fees'}    
                    >
                    <span className="ml-2 whitespace-nowrap">Fees</span>
                </Link>

                {isArchiveAccess &&
                    <Link
                        className='justify-self-end  whitespace-nowrap border-gray-500 border p-2 px-4 rounded-xl cursor-pointer'
                        href={'/admin/orders/archive'}
                    >
                        <span className="ml-2 whitespace-nowrap">Archive</span>
                    </Link>
                }

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
                    <thead className="sticky top-0 z-[90] border border-gray-500 bg-white">
                            <tr>
                        {(isUpdateAccess || isDeleteAccess || isCrafting) && (
                            <th>
                                <div className="border-y flex items-center justify-evenly  border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                {(isCrafting || isSending ||isExcel||isOrderAction) &&
                                        <div className="p-2 flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="size-4 m-0"
                                                // checked={}
                                                onChange={(e) => handleSelecteAllOrders()} 
                                            />
                                        </div>
                                }
                                تعديل       
                                </div>
                            </th>
                        )}
                          {thElement.map((item, index) => (
                            index === 1 ? (
                                <>
                                <th className="bg-blue-100" key={`orders-${index}`} colSpan={longesOrder.length}>
                                    <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                    الطلبيات
                                    </div>
                                </th>
                                {item}
                                </>
                            ) : (
                                item
                            )
                        ))}
                           
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
                        <thead className="sticky top-0 z-[90] border border-[rgba(0, 40, 100, 0.12)] bg-white">
                                <tr>
                            {(isUpdateAccess || isDeleteAccess || isCrafting) && (
                                <th>
                                    <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                        تعديل       
                                    </div>
                                   
                                </th>
                            )}
                                {thElement.map((item, index) => (
                                    index === 1 ? (
                                        <>
                                        <th className="bg-blue-100" key={`orders-${index}`} colSpan={longesOrder.length}>
                                            <div className="border-y border-solid border-[rgba(0, 40, 100, 0.12)] p-[13px]">
                                            الطلبيات
                                            </div>
                                        </th>
                                        {item}
                                        </>
                                    ) : (
                                        item
                                    )
                                ))}
                            
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