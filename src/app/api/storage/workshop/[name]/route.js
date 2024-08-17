import Workshop from "../../../../models/workshop"
import {dbConnect} from "../../../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function GET(req,{params}){
   
    await dbConnect();

    try {
      const result = await Workshop.findOne({ name: params.name });
      console.log(result);
    
      if (!result) {
        return new Response(null, { status: 404 }); // Use 404 Not Found if no result
      }
    
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error) {
    //   console.error("Error fetching the workshop:", error);
      return new Response(null, { status: 500 }); // Use 500 Internal Server Error for general errors
    }
    
   
}

// export async function POST(req) {
//     try{
//       await dbConnect()
      
//       const rewMates = await req.json()
  
//       Workshop.create(rewMates)
  
//       return new NextResponse("rew Mate created ")
  
//     }catch(err){
//       return new NextResponse("Error :" + err)
// }
    
// }