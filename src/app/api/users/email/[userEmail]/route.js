import { NextResponse } from 'next/server'
import User from '../../../../models/users'
import {dbConnect} from '../../../../lib/dbConnect'


export async function GET(req,{params}) {
    try{
        await dbConnect()
        const result = await User.findOne({email:params.userEmail})

        return Response.json(result)
           
      }catch(err){
        return new NextResponse("Error :" + err)
      }
    
}
