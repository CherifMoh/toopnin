import OrdersArchive from "../../../models/ordersArchive"
import {dbConnect} from "../../../lib/dbConnect"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(){

    const store = cookies()

    try{
        await dbConnect()

        const result = await OrdersArchive.find().sort({_id: -1})

        return Response.json(result)
    }catch(err){
        return new NextResponse("Error :" + err)
    }
}

