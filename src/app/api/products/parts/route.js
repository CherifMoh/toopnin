
import Product from "../../../models/products"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function GET() {

  const store = cookies()

  try{
    await dbConnect()
    return Product.find().sort({_id: -1}).select('parts title options')
    .then(result=> Response.json(result))
    .catch(err=>Response.json({message:err.message}))

    
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}
