import Order from "../../../models/orders";
import { dbConnect } from "../../../lib/dbConnect";
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    await dbConnect();
    

    const result = await Order.find({state:'مؤكدة' ,deliveryAgent:'ZR'}).sort({ _id: -1 }).select('deliveryAgent DLVTracking state tracking state inDelivery orders');

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.error({ message: "Error: " + err.message });
  }
}

