
import Tage from "../../../models/tags"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"


export async function GET() {
  try{
    await dbConnect()
    const result = await Tage.find()
    return Response.json(result)
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}

export async function POST(req) {
  try{
    await dbConnect()
    
    const tag = await req.json()

    Tage.create(tag)

    return new NextResponse("Design created " + tag.name)

  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}

