import RewMates from "../../../models/rewMates"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function GET(){
    try{
        await dbConnect()

        const result = await RewMates.find()

        return Response.json(result)
    }catch(err){
        return new NextResponse("Error :" + err)
    }
}

export async function POST(req) {
    try{
      await dbConnect()
      
      const rewMates = await req.json()
  
      RewMates.create(rewMates)
  
      return new NextResponse("rew Mate created ")
  
    }catch(err){
      return new NextResponse("Error :" + err)
}
    
}