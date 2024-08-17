import ProductsStorge from "../../../../models/ProductsStorge"
import {dbConnect} from "../../../../lib/dbConnect"
import { NextResponse } from "next/server"

export async function GET(req,{params}){
    try{
        await dbConnect()

        const result = await ProductsStorge.find({title:params.title})

        return Response.json(result)
    }catch(err){
        return new NextResponse("Error :" + err)
    }
}
