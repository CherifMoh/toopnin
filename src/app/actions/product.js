'use server'

import Product from "../models/products"
import { dbConnect } from "../lib/dbConnect"
import axios from "axios"


export async function addProduct(newProduct){ 
    try{
        await dbConnect()
    
        Product.create(newProduct)
    
        return "product created " + newProduct.title
    
      }catch(err){
        return "Error :" + err
      } 
}

export async function deleteProduct(id){
  try{
    await dbConnect()
    const res = await Product.findByIdAndDelete(id)

    return res
  }catch(err){  
    throw Error(err)
  }
}

export async function getOneProduct(id){
  try{
    await dbConnect()

    const res = await Product.findById(id)

    return res
  }catch(err){  
    throw Error(err)
  }
    
}
export async function getProductCost(id){
  try{
    await dbConnect()

    const res = await Product.findById(id).select('cost')
    console.log(res)
    return res
  }catch(err){  
    throw Error(err)
  }
    
}

