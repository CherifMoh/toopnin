import Order from "../../models/orders";
import { dbConnect } from "../../lib/dbConnect";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, subDays } from 'date-fns';

export async function GET(req) {
  try {
    await dbConnect();

    const dateFilter = req.nextUrl.searchParams.get('date');
    let query = {};

    const oneHourBefor = new Date();
    const today = new Date(oneHourBefor);
    today.setHours(oneHourBefor.getHours() + 1);
    
    const startToday = startOfDay(today);
    startToday.setHours(startToday.getHours() + 1);
    const endToday = endOfDay(today);
    endToday.setHours(endToday.getHours() + 1);


    if (dateFilter === 'today') {
      query = {
        updatedAt: {
          $gte: startToday,
          $lte: endToday,
        },
      };
    } else if (dateFilter === 'yesterday') {
      const startYesterday = startOfDay(subDays(today, 1));
      startYesterday.setHours(startYesterday.getHours() + 1);
      const endYesterday = endOfDay(subDays(today, 1));
      endYesterday.setHours(endYesterday.getHours() + 1);
      query = {
        updatedAt: {
          $gte: startYesterday,
          $lte: endYesterday,
        },
      };
    } else if (dateFilter === 'this Week') {
      const startOfWeek = startOfDay(subDays(today, 6));
      query = {
        updatedAt: {
          $gte: startOfWeek,
          $lte: endToday,
        },
      };
    } else if (dateFilter === 'this Month') {
      const startOfMonth = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
      const endOfMonth = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
      query = {
        updatedAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      };
    } else if (dateFilter === 'maximum') {
      // No additional filtering needed for 'maximum'
    } else {
      // Default to return all orders if no valid date filter is provided
    }

    const result = await Order.find(query).sort({ _id: -1 });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.error({ message: "Error: " + err });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    let formattedIp = ip;

    // Handle IPv6 addresses like ::ffff:127.0.0.1 or ::1
    if (formattedIp.startsWith('::ffff:')) {
        formattedIp = formattedIp.split('::ffff:')[1];
    } else if (formattedIp === '::1') {
        formattedIp = '127.0.0.1';
    }

    const order = await req.json();

    order.ip = formattedIp;


    Order.create(order);

    return new NextResponse("Order created");
  } catch (err) {
    return new NextResponse("Error :" + err);
  }
}
