
import Wilayas from "../../../models/wilayas"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function GET() {

  const store = cookies()

  try{
    await dbConnect()
    return Wilayas.findOne().sort({_id: -1}).select('communes')
    .then(result=> Response.json(result))
    .catch(err=>Response.json({message:err.message}))

    
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}
