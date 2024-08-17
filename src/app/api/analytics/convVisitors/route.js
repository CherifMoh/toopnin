
import Visitors from "../../../models/visitors"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"


export async function GET() {
  try{
    await dbConnect()
    const visitors = await Visitors.find({title:'conversion'})
    return Response.json(visitors)
  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}
export async function PUT(req) {
  try{
    await dbConnect()
    
    const previsitors = await Visitors.findOne({ title: 'conversion' });

    if (!previsitors) {
      // If the document doesn't exist, you might want to handle this case
      return new NextResponse("Document not found");
    }

    const updatedNumber = previsitors.number + 1;

    // Update the document with the new number value
    const updated = await Visitors.findOneAndUpdate(
      { title: 'conversion' },
      { $set: { number: updatedNumber } },
      { new: true }
    );

   
    Visitors.findOneAndUpdate({ title: 'conversion' }, updated, { new: true })

    return new NextResponse("new visitor added")

  }catch(err){
    return new NextResponse("Error :" + err)
  }
  
}


