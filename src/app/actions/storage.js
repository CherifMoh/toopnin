'use server'


import Product from "../models/products"
import Archive from "../models/archive"
import { getUserNameByEmail } from "../actions/users"

import { dbConnect } from "../lib/dbConnect"
import { cookies } from "next/headers"



export async function editAddProduct(id,newQnts){
    await dbConnect()
    
    let result = await Product.findOne({_id:id})


    result.qnts =[...result.qnts, newQnts]
    const newDocument = await Product.findOneAndUpdate({_id:id}, result, { new: true })
    const userName = await getUserNameByEmail(cookies().get('user-email').value)
   
    AddToArchive({
        user: userName,
        name: result.title,
        qnt: newQnts.qnt,
        price: newQnts.price,
        action:'ادخال',
    })
    return newDocument       
}

export async function editMinusProduct(id, newQnt, note, option,title) {
    const firstQnt = newQnt;
    let result = await Product.findOne({ _id: id });
    console.log(result)

    if(!result || !result.qnts || !result.qnts.length){
        result = await Product.findOne({ title: title });

    }
    if (!result || !result.qnts || !result.qnts.length) {
        console.log('No data found or qnts array is empty');
        return { success: false };
    }

    // Convert qnt values to numbers since they are strings in the database
    let qnts = result.qnts.map(item => ({
        price: item.price,
        qnt: Number(item.qnt),
        option: item.option
    }));

    // Calculate the total quantity available
    const totalQnt = qnts.reduce((sum, item) => sum + item.qnt, 0);

    // Check if newQnt is greater than total quantity available
    console.log('newQnt: '+newQnt)
    console.log('totalQnt: '+totalQnt)
    if (newQnt > totalQnt) {
        console.log('success: '+false)
        return { success: false };
    }


    let removedItems = [];

    // Process the qnts array from the last element to the first
    for (let i = 0; i < qnts.length && newQnt > 0; i++) {
        if (option === undefined || qnts[i].option === option) {
            if (qnts[i].qnt <= newQnt) {
                newQnt -= qnts[i].qnt; // Decrease newQnt by the quantity of the current element
                removedItems.push({ price: qnts[i].price, qnt: qnts[i].qnt, option: qnts[i].option }); // Store removed item
                qnts.splice(i, 1);  // Remove the element from the array
                i--; // Adjust the index after removing an element
            } else {
                removedItems.push({ price: qnts[i].price, qnt: newQnt, option: qnts[i].option }); // Store partially removed item
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

    const newDocument = await Product.findOneAndUpdate({ _id: id }, result, { new: true });

    const userName = await getUserNameByEmail(cookies().get('user-email').value)
   
    AddToArchive({
        user: userName,
        name: title,
        qnt: firstQnt,
        note,
        action: 'اخراج',
    });

    return { success: true, removedItems: removedItems };
}

export async function AddToArchive(newData){
    await dbConnect()
    
    Archive.create(newData)
    
}

