import Category from "../../models/category"
import {dbConnect} from "../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function GET(){
    try{
        await dbConnect()
        return Category.find()
            .then(result=> Response.json(result))
            .catch(err=>Response.json({message:err.message}))
    }catch(err){
        return new NextResponse("Error :" + err)
    }
}

export async function POST(req) {
    try{
      await dbConnect()
      
      const category = await req.json()
  
      Category.create(category)
  
      return new NextResponse("category created " + category.title)
  
    }catch(err){
      return new NextResponse("Error :" + err)
}
    
}