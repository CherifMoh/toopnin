'use server'

import Order from "../models/orders"
import OrdersArchive from "../models/ordersArchive"
import { dbConnect } from "../lib/dbConnect"
import axios from "axios"
import BlackList from "../models/blackLists"
import { getUserNameByEmail } from "./users"
import { cookies } from "next/headers"

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

export async function fetchOrderStatus(tracking) {
  try{
    const response = await axios.post('https://procolis.com/api_v1/lire', 
      {
          Colis: [
              { "Tracking": tracking }
          ]
      }, 
      {
          headers: {
              key: process.env.ZR_API_KEY,
              token: process.env.ZR_API_TOKEN
          }
      }
    );
    return response.data
  }catch(err){
      console.log(err.message)
      return null
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
