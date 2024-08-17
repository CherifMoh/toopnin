'use server'

import Order from "../models/orders"
import { dbConnect } from "../lib/dbConnect"

export async function addOrder(formData){ 
    await dbConnect()
    Order.create(formData)   
}

export async function deleteOrder(id){
    await dbConnect()
    const res = await Order.findByIdAndDelete(id)        
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