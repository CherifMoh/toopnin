'use server'


import Product from "../models/products"
import Archive from "../models/archive"

import { dbConnect } from "../lib/dbConnect"



export async function editAddProduct(id,newQnts){
    await dbConnect()
    
    let result = await Product.findOne({_id:id})

    // if(!result){
    //     ProductsStorage.create({
    //         name,
    //         qnts: newQnts
    //     })   
    //     return
    // }

    result.qnts =[...result.qnts, newQnts]
    const newDocument = await Product.findOneAndUpdate({_id:id}, result, { new: true })
    AddToArchive({
        name: result.title,
        qnt: newQnts.qnt,
        price: newQnts.price,
        action:'ادخال',
        type:'منتح نهائي',
    })
    return newDocument       
}

export async function editMinusProduct(id,newQnt,note,option){
   
    const firstQnt = newQnt
    let result = await Product.findOne({_id:id})
    
    if (!result || !result.qnts || !result.qnts.length) {
        console.log('No data found or qnts array is empty');
        return;
    }

    // Convert qnt values to numbers since they are strings in the database
    let qnts = result.qnts.map(item => ({
        price: item.price,
        qnt: Number(item.qnt),
        option: item.option
    }));

    // Process the qnts array from the last element to the first
    for (let i = 0; i < qnts.length && newQnt > 0; i++) {
        if (option === undefined || qnts[i].option === option) {
            if (qnts[i].qnt <= newQnt) {
                newQnt -= qnts[i].qnt; // Decrease newQnt by the quantity of the current element
                qnts.splice(i, 1);  // Remove the element from the array
                i--; // Adjust the index after removing an element
            } else {
                qnts[i].qnt -= newQnt; // Decrease the element's quantity by newQnt
                newQnt = 0; // Set newQnt to 0
            }
        }
    }

    // Convert qnt values back to strings before updating the database
    qnts = qnts.map(item => ({
        price: item.price,
        qnt: item.qnt.toString(),
        ...(item.option && { option: item.option })
    }));
    

    // Save the updated qnts array back to the database
    result.qnts = qnts;
    


    const newDocument = await Product.findOneAndUpdate({_id:id}, result, { new: true })
    AddToArchive({
        name: result.title,
        qnt: firstQnt,
        note,
        action:'اخراج',
        type:'منتح نهائي',
    })

    return newDocument;
}

export async function AddToArchive(newData){
    await dbConnect()
    
    Archive.create(newData)
    
}

