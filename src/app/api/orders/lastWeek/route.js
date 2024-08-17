
import Order from "../../../models/orders"
import { dbConnect } from "../../../lib/dbConnect"
import { NextResponse } from "next/server"
import { cookies } from "next/headers";


export async function GET() {

  const store = cookies()

  try {

    await dbConnect();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await Order.find({
      tracking: 'delivered',
      createdAt: { $gte: oneWeekAgo }
    }).sort({ _id: -1 }).select('createdAt');

    return Response.json(result)

  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}
