import User from "../../../models/users"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"



export async function DELETE(req,{params}) {
  try{
    await dbConnect()
    return User.deleteOne({_id:params.productId})
    .then(result=> Response.json(result))
    .catch(err=>Response.json({message:err.message}))
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}

export async function PUT(req,{params}) {
  try{
    await dbConnect()
    console.log(params.userId)
    const newUser = await req.json()
    await User.findByIdAndUpdate({_id:params.userId},newUser)

    return new NextResponse("user Updated ")

  }catch(err){
    return new NextResponse.error("Error :" + err)
  }
  
}