import { NextResponse } from 'next/server'
import Role from '../../../models/roles'
import {dbConnect} from '../../../lib/dbConnect'
import { cookies } from 'next/headers'

export async function GET() {

  const store = cookies()

    try {
  
      await dbConnect()
      const result = await Role.find()

      return Response.json(result)
  
    } catch (err) {
      return new NextResponse("Error :" + err)
    }
  
}