import Order from "../../../models/orders"
import { dbConnect } from "../../../lib/dbConnect"
import { getUserNameByEmail } from "../../../actions/users"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AddToArchive, checkEmailAllowance } from "../../../actions/order";

export async function PUT(req, { params }) {
  try {
    await dbConnect()

    const NewOrder = await req.json()
    const id = params.orderId

 

    if(!NewOrder.adminEmail){
      NewOrder.adminEmail = cookies().get('user-email')?.value
    }else{
      const emailAllowed = await checkEmailAllowance(id)
      if(!emailAllowed){
        return Response.json({success:false,message:"you are not allowed to edit this order"})
      }
    }

    const newDocument = await Order.findByIdAndUpdate(id, NewOrder, { new: true })

    revalidatePath('/admin/orders')
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
    
    AddToArchive({
      user: userName,
      tracking: NewOrder.DLVTracking,
      action: "تم تعديل طلب",
    }); 
    return Response.json({success:true,message:"order updated"})

  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}
