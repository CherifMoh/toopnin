import Order from "../../../models/orders";
import { dbConnect } from "../../../lib/dbConnect";
import { NextResponse } from "next/server";


export async function GET(req) {
  try {
    await dbConnect();
    

    const result = await Order.find({deliveryAgent:'Livreur'}).sort({ _id: -1 }).select('state tracking inDelivery');

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.error({ message: "Error: " + err.message });
  }
}

