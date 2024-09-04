import PixelID from "../../models/pixel"
import {dbConnect} from "../../lib/dbConnect"
import { NextResponse } from "next/server"


export async function GET() {
  try{
    await dbConnect()
    return PixelID.find().sort({_id: -1})
    .then(result=> Response.json(result))
    .catch(err=>Response.json({message:err.message}))

    
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}