import Tage from "../../../../models/tags"
import {dbConnect} from "../../../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function DELETE(req,{params}) {
    try{
      await dbConnect()
      await Tage.findByIdAndDelete({_id:params.tagId})
  
      return new NextResponse("Tage Deleted ")
  
    }catch(err){
      return new NextResponse("Error :" + err)
    }
    
}