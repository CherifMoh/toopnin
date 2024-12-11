'use server'

import Order from "../models/orders"
import OrdersArchive from "../models/ordersArchive"
import { dbConnect } from "../lib/dbConnect"
import axios from "axios"
import BlackList from "../models/blackLists"
import { getUserNameByEmail, isSuper } from "./users"
import { cookies } from "next/headers"
import FetchDate from "../models/shpifyFetchdate"

export async function addOrder(formData){ 
  try{

    await dbConnect()
    Order.create(formData)      
    
  }catch(err){
    console.log(err)
  }
}

export async function deleteOrder(id){
  try{

    await dbConnect()
    const res = await Order.findByIdAndDelete(id)       
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
    
    AddToArchive({
      user: userName,
      tracking: res.DLVTracking,
      action: "حذف",
    }); 
  }catch(err){
    console.log(err)
  }
}

export async function getOrder(methode, value){
    await dbConnect()
    const res = await Order.find({[methode]: value}).sort({ _id: -1 })    
    const formattedRes = res.map(order => {
        return {
          ...order._doc,
          createdAt: order.createdAt.toISOString(),  // or any other date format
          updatedAt: order.updatedAt.toISOString()   // or any other date format
        };
      }); 
    return formattedRes
}
export async function updateByNumber(phone, state){
  await dbConnect()
  let res 
  if(state !== "غير مؤكدة" && state !== "En preparation"){
    res = await Order.findOneAndUpdate({phoneNumber: phone}, {tracking: state, state: 'مؤكدة', inDelivery: true})
  }else if(state === "غير مؤكدة"){
    res = await Order.findOneAndUpdate({phoneNumber: phone}, {tracking: 'غير مؤكدة', state: 'غير مؤكدة'})
  }else{
    res = await Order.findOneAndUpdate({phoneNumber: phone}, {tracking: state, state: 'مؤكدة'})
  }
}
export async function updateByDLVTracking(DLVTracking, state){
  await dbConnect()
  let res 
  if(state !== "غير مؤكدة" && state !== "En preparation"){
    res = await Order.findOneAndUpdate({DLVTracking: DLVTracking}, {tracking: state, state: 'مؤكدة', inDelivery: true})
  }else if(state === "غير مؤكدة"){
    res = await Order.findOneAndUpdate({DLVTracking: DLVTracking}, {tracking: 'غير مؤكدة', state: 'غير مؤكدة', inDelivery: false})
  }else{
    res = await Order.findOneAndUpdate({DLVTracking: DLVTracking}, {tracking: state, state: 'مؤكدة', inDelivery: false})
  }
}

export async function addOrderSchedule(order,schedule) {
    

  try {
      await dbConnect();

      const newOrder = {
          ...order,
          schedule: schedule
      }

      await Order.findByIdAndUpdate(order._id,newOrder,{new:true});

      const userName = await getUserNameByEmail(cookies().get('user-email').value)

      AddToArchive({
        user: userName,
        tracking: order.DLVTracking,
        action: "تم اضافة طلب",
      }); 

      return 'updated';
  } catch (error) {
      console.error("Error creating role:", error);
      throw error;
  }
}

export async function fetchAllOrderStatuses(orders) {
  try {
      const requestBody = {
          Colis: orders.map((order) => ({ Tracking: order.DLVTracking })),
      };
      

      const response = await axios.post(
          'https://procolis.com/api_v1/lire',
          requestBody,
          {
              headers: {
                  key: process.env.ZR_API_KEY,
                  token: process.env.ZR_API_TOKEN,
              },
          }
      );

      // // const trackingResults = response.data; // Assuming response contains tracking info
      // // const trackingMap = {};
      // // orders.forEach((order, index) => {
      // //     trackingMap[order._id] = trackingResults[index]?.tracking || order.tracking; // Keep old tracking if no change
      // // });

      return response.data;
  } catch (err) {
      console.log(err.message);
      return {};
  }
}

export async function ZrfetchDate() {
  try {
    let fetchDateDoc = await FetchDate.findOne({ name: 'ZR' });

    // If no document exists, create one and return true
    if (!fetchDateDoc) {
      fetchDateDoc = new FetchDate({ name: 'ZR', updatedAt: new Date() });
      await fetchDateDoc.save();
      return true;
    }

    const now = new Date();
    const lastUpdated = new Date(fetchDateDoc.updatedAt);

    // Check if 10 minutes have passed
    const tenMinutesInMs = 10 * 60 * 1000;
    
    if (now - lastUpdated >= tenMinutesInMs) {
      fetchDateDoc.updatedAt = now;
      await fetchDateDoc.save(); // Update the `updatedAt` field
      return true;
    }

    return false; // Less than 10 minutes
  } catch (err) {
    console.log(err.message);
    return null; // Handle error scenario
  }
}




export async function addOrderToZR(order) {
  try{
    const response = await axios.post('https://procolis.com/api_v1/add_colis', 
      {
          Colis: [
            order
          ]
      }, 
      {
          headers: {
              key: process.env.ZR_API_KEY,
              token: process.env.ZR_API_TOKEN
          }
      }
    );
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
   
    AddToArchive({
        user: userName,
        tracking: order.DLVTracking,
        action: "أُضيف إلى شركة التوصيل",
    });
    return response.data
  }catch(err){
      console.log(err.message)
      return null
  }
}

export async function expedieOrderToZR(tracking) {
  try{
    const response = await axios.post('https://procolis.com/api_v1/pret ', 
      {
          Colis: [
            {Tracking: tracking }
          ]
      }, 
      {
          headers: {
              key: process.env.ZR_API_KEY,
              token: process.env.ZR_API_TOKEN
          }
      }
    );
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
   
    AddToArchive({
        user: userName,
        tracking: tracking,
        action: "شحن إلى شركة التوصيل",
    });
    return response.data
  }catch(err){
      console.log(err.message)
      return null
  }
}

export async function addToBlackList(ip,phoneNumber) {
  try {
    await dbConnect()


    // Find the blacklist entry with name 'IP'
    const blacklist = await BlackList.findOne({ name: 'IP' });

    if (!blacklist) {
        // If no blacklist entry exists, create one
        await BlackList.create({
            name: 'IP',
            ip: [{ip: ip,phoneNumber:phoneNumber}]
        });
    } else {
        // If blacklist entry exists, add the IP address if it's not already present
        if (!blacklist.ip.includes(ip)) {
            blacklist.ip.push({ip: ip,phoneNumber:phoneNumber});
            await blacklist.save();
        }
    }

    const userName = await getUserNameByEmail(cookies().get('user-email').value)
   
    AddToArchive({
        user: userName,
        tracking: phoneNumber,
        action: "أُضيف إلى القائمة السوداء",
    });

    return {sucsess: true, message: "IP added to blacklist"}

  } catch (err) {
    return {sucsess: false, err:err}
  }
}

export async function addAbandonedCheckout(order) {
  try {
    await dbConnect();

    const oldOrders = await Order.find({ phoneNumber: order.phoneNumber, state:'abandoned' });

    const newOrder ={
      ...order,
      state:'abandoned',
    }

    if (!oldOrders || oldOrders.length === 0) {
      // If no order exists, create one
      await Order.create(newOrder);
    } else {

      for (const oldOrder of oldOrders) {
        await Order.findByIdAndDelete(oldOrder._id);
      }
      // Delete the old orders and create a new one
      await Order.create(newOrder);
    }

    return 'updated';
  } catch (err) {
    return err;
  }
}

export async function AddToArchive(newData){
  await dbConnect()
  
  OrdersArchive.create(newData)
  
}

export async function checkEmailAllowance(id) {
  try {
    await dbConnect()
    const order = await Order.findById(id);

    if (!order) {
      console.log('Order not found');
      return false;
    }

    const email = cookies().get('user-email').value;

    if (email === order.adminEmail || !order.adminEmail) {
      return true;
    }

    const superAccess = await isSuper('orders');

    if (superAccess) {
      return true;
    }


    return false;
  } catch (error) {
    console.error('Error checking email allowance:', error);
    return false;
  }
}

export async function fetchShopify() {
  try {
    // Connect to the database if not already connected
    await dbConnect();

    // Retrieve the last fetch date
    let fetchDateDoc = await FetchDate.findOne({ name: 'shopify' });
    let createdAtMin = null;

    if (fetchDateDoc) {
      const date = new Date(fetchDateDoc.updatedAt); // Create a Date object from updatedAt
      createdAtMin = date.toISOString(); // Initial value for comparison
    }

    // Construct the Shopify API URL
    const url = createdAtMin
      ? `https://knin.store/admin/api/2024-10/orders.json`
      : 'https://knin.store/admin/api/2024-10/orders.json';

    // Fetch orders from Shopify
    const res = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN, // Replace with your actual access token
        'Content-Type': 'application/json',
      },
    });


    const allOrders = res.data.orders; // Shopify orders array
    console.log("Created At Min (before filter):", createdAtMin);
    console.log("All Orders Length:", allOrders.length);
    // Refilter orders to match `createdAtMin` with full ISO timestamp
    let filteredOrders = allOrders;
    if (createdAtMin) {
      const minDate = new Date(createdAtMin);
      
      filteredOrders = allOrders.filter(order => {
        
        return new Date(order.created_at) > minDate
      });
      
    }


   
    

    console.log(filteredOrders.length)

    return filteredOrders; // Return the filtered orders

  } catch (error) {
    console.error('Error fetching Shopify orders:', error.response?.data || error.message);
    throw error; // Re-throw the error for further handling
  }
}

export async function updateShopifyDate() {
  let fetchDateDoc = await FetchDate.findOne({ name: 'shopify' });

    if (!fetchDateDoc) {
      // Create a new document if it doesn't exist
      fetchDateDoc = new FetchDate({ name: 'shopify', updatedAt: new Date() });
    } else {
      // Update the `updatedAt` field
      fetchDateDoc.updatedAt = new Date(); // This will influence future `createdAtMin`
    }
  
    // Add a 20-second delay
    // await new Promise((resolve) => setTimeout(resolve, 20000));
    await fetchDateDoc.save(); // Save changes to the database
  
}
