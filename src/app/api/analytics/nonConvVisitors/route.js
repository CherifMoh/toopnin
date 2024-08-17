
import Visitors from "../../../models/visitors"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"


export async function GET() {
  try{
    await dbConnect()
    const visitors = await Visitors.find({title:'Non conversion'})
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
    const cookie = request.cookies.get('visitors-middleware')

    console.log('cookie:'+ cookie)

    const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    cookies().set("visitors-middleware", 'true', {
        path: "/",
        domain: "localhost",
        maxAge: thirtyDaysFromNow,
        httpOnly: false,
        secure: false,
    });

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


