import BlackList from "../../../models/blackLists"
import { dbConnect } from "../../../lib/dbConnect"
import { NextResponse, NextRequest } from "next/server"



export async function GET(req) {

  try {
    await dbConnect()
    const ip = req.nextUrl.searchParams.get('ip')
    const blacklist = await BlackList.findOne({ name: 'IP' })
    if (blacklist && blacklist.ip?.some(entry => entry.ip === ip)) {
      return new NextResponse(true);
    }
    return new NextResponse(false)
  } catch (error) {
      throw error
  }

}