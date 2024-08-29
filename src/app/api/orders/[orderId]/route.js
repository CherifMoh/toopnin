import Order from "../../../models/orders"
import { dbConnect } from "../../../lib/dbConnect"
import { getUserNameByEmail } from "../../../actions/users"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function PUT(req, { params }) {
  try {
    await dbConnect()

    const NewOrder = await req.json()
    const id = params.orderId

    NewOrder.adminEmail = cookies().get('user-email')?.value

    const newDocument = await Order.findByIdAndUpdate(id, NewOrder, { new: true })

    revalidatePath('/admin/orders')
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
    
    AddToArchive({
      user: userName,
      tracking: NewOrder.DLVTracking,
      action: "تم تعديل طلب",
    }); 
    return new NextResponse(newDocument)

  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}
