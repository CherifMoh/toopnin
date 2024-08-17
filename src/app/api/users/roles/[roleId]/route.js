import { NextResponse } from 'next/server'
import Role from '../../../../models/roles'
import {dbConnect} from '../../../../lib/dbConnect'

export async function GET(req,{params}) {
    try {
      await dbConnect()
      const result = await Role.findOne({_id:params.roleId})
      return Response.json(result)
  
    } catch (err) {
      return new NextResponse("Error :" + err)
    }
  
}