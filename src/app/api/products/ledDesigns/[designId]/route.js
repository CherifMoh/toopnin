import Design from "../../../../models/design"
import {dbConnect} from "../../../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function DELETE(req,{params}) {
    try{
      await dbConnect()
      await Design.findByIdAndDelete({_id:params.designId})
  
      return new NextResponse("Design Deleted ")
  
    }catch(err){
      return new NextResponse("Error :" + err)
    }
    
}
export async function PUT(req,{params}) {
    try{
      await dbConnect()
      const newDesign = await req.json()
      await Design.findByIdAndUpdate({_id:params.designId},newDesign)
  
      return new NextResponse("Design Updated ")
  
    }catch(err){
      return new NextResponse("Error :" + err)
    }
    
}