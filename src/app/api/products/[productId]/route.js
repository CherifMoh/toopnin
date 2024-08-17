import Product from "../../../models/products"
import Design from "../../../models/design"
import { dbConnect } from "../../../lib/dbConnect"
import { NextResponse } from "next/server"


export async function GET(req, { params }) {
  try {
    await dbConnect()

    let result
    if (params.productId !== 'LedPainting') {
      result = await Product.find({ _id: params.productId });
    } else {
      result = await Product.find({ title: 'Led Painting' });
    }

    if (result.length === 0) {
      result = await Design.find({ _id: params.productId });
    }

    return Response.json(result);

  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}

export async function DELETE(req, { params }) {
  try {
    await dbConnect()
    return Product.deleteOne({ _id: params.productId })
      .then(result => Response.json(result))
      .catch(err => Response.json({ message: err.message }))
  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}

export async function PUT(req, { params }) {
  try {
    await dbConnect()
    const newProduct = await req.json()
    await Product.findByIdAndUpdate({ _id: params.productId }, newProduct)

    return new NextResponse("Product Updated ")

  } catch (err) {
    return new NextResponse("Error :" + err)
  }

}