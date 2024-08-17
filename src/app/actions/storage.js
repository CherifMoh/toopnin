'use server'

import RewMates from "../models/rewMates"
import Workshop from "../models/workshop"
import ProductsStorage from "../models/ProductsStorge"
import Archive from "../models/archive"

import { dbConnect } from "../lib/dbConnect"

export async function addRewMates(formData){ 
    await dbConnect()
    RewMates.create(formData)   
}

export async function deleteRewMate(id){
    await dbConnect()
    const res = await RewMates.findByIdAndDelete(id) 
    return res       
}
export async function editAddRewMateQnt(id,newQnts,name){
    await dbConnect()

    let result 

    if(!name){
        result = await RewMates.findById(id)
    }else{
        result = await RewMates.findOne({name:name})     
    }

    if(!newQnts.price){
        const lastPrice = result.qnts[result.qnts.length - 1].price
        newQnts = {...newQnts,price:lastPrice}
    }

    result.qnts =[...result.qnts, newQnts]

    let newDocument

    if(!name){
        newDocument = await RewMates.findByIdAndUpdate(id, result, { new: true })
    }else{
        newDocument = await RewMates.findOneAndUpdate({name:name}, result, { new: true })
    }

    AddToArchive({
        name,
        qnt: newQnts.qnt,
        price: newQnts.price,
        action:'ادخال',
        type:'مواد اولية',
    })


    return newDocument       
}

export async function editMinusRewMateQnt(id,newQnt,name,note){
    await dbConnect()

    const firstQnt = newQnt

    let result
    if(!name){
        result = await RewMates.findById(id);
    }else{
        result = await RewMates.findOne({name:name});
    }
 
    if (!result || !result.qnts || !result.qnts.length) {
        console.log('No data found or qnts array is empty');
        return;
    }

    // Convert qnt values to numbers since they are strings in the database
    let qnts = result.qnts.map(item => ({
        price: item.price,
        qnt: Number(item.qnt)
    }));

    // Process the qnts array from the last element to the first
    for (let i = 0; i < qnts.length && newQnt > 0; i++) {
        if (qnts[i].qnt <= newQnt) {
            newQnt -= qnts[i].qnt;
            qnts.splice(i, 1);  // Remove the element from the array
        } else {
            qnts[i].qnt -= newQnt;
            newQnt = 0;
        }
    }

    // Convert qnt values back to strings before updating the database
    qnts = qnts.map(item => ({
        price: item.price,
        qnt: item.qnt.toString()
    }));

    // Save the updated qnts array back to the database
    result.qnts = qnts;

    let newDocument

    if(!name){
        newDocument = await RewMates.findByIdAndUpdate(id, result, { new: true })
    }else{
        newDocument = await RewMates.findOneAndUpdate({name:name}, result, { new: true })
    }

    AddToArchive({
        name,
        qnt: firstQnt,
        note,
        action:'اخراج',
        type:'مواد اولية',
    })

    return newDocument;
}

export async function editAddPart(name,newQnts){
    await dbConnect()
    
    let result = await Workshop.findOne({name:name})

    if(!result){
        Workshop.create({
            name:name,
            qnts: newQnts
        })   

        return
    }

    if (!newQnts.price && newQnts.price !== 0) {
        const lastQnt = result.qnts[result.qnts.length - 1];
        newQnts.price = lastQnt ? lastQnt.price : 0; // Use the last quantity's price or default to 0
    }

    result.qnts =[...result.qnts, newQnts]
    const newDocument = await Workshop.findOneAndUpdate({name:name}, result, { new: true })

    AddToArchive({
        name,
        qnt: newQnts.qnt,
        price: newQnts.price,
        action:'ادخال',
        type:'قطعة',
    })

    return newDocument       
}

export async function editMinusPart(name, newQnt, note, ready) {
    await dbConnect();
    
    const firstQnt = newQnt;

    let result = await Workshop.findOne({ name: name });

    if (!result || !result.qnts || !result.qnts.length) {
        console.log('No data found or qnts array is empty');
        return;
    }

    // Convert qnt values to numbers since they are strings in the database
    let qnts = result.qnts.map(item => ({
        price: item.price,
        ready: item.ready,
        qnt: Number(item.qnt)
    }));

    // Array to collect deleted quantities
    let deletedQnts = [];

    // Process the qnts array from the last element to the first
    for (let i = 0; i < qnts.length && newQnt > 0; i++) {
    
        if (ready !== undefined && qnts[i].ready === ready) {
            if (qnts[i].qnt <= newQnt) {
                newQnt -= qnts[i].qnt;
                deletedQnts.push(qnts[i]);
                qnts.splice(i, 1);  // Remove the element from the array
            } else {
                let remainingQnt = qnts[i].qnt - newQnt;
                deletedQnts.push({
                    price: qnts[i].price,
                    ready: qnts[i].ready,
                    qnt: newQnt
                });
                qnts[i].qnt = remainingQnt;
                newQnt = 0;
            }
        }
    }

    // Convert qnt values back to strings before updating the database
    qnts = qnts.map(item => ({
        price: item.price,
        ready: item.ready,
        qnt: item.qnt.toString()
    }));

    // Save the updated qnts array back to the database
    result.qnts = qnts;

    const newDocument = await Workshop.findOneAndUpdate({ name: name }, result, { new: true });

    AddToArchive({
        name,
        qnt: firstQnt,
        note,
        action: 'اخراج',
        type: 'قطعة',
    });

    return deletedQnts;
}

export async function editReadyPart(name, numberToUpdate) {
    await dbConnect();

    if(!numberToUpdate || numberToUpdate === 0) return
    let removedQnts = await editMinusPart(name, numberToUpdate, null, false);

    removedQnts = removedQnts.map(item=>{
        return{
            ...item,
            ready:true
        }
    })

    removedQnts.forEach(item=>{
        editAddPart(name,item)
    })

    // return updatedDocument;
}

export async function editAddProduct(name,newQnts){
    await dbConnect()
    
    let result = await ProductsStorage.findOne({name:name})

    if(!result){
        ProductsStorage.create({
            name,
            qnts: newQnts
        })   
        return
    }

    result.qnts =[...result.qnts, newQnts]
    const newDocument = await ProductsStorage.findOneAndUpdate({name:name}, result, { new: true })
    AddToArchive({
        name,
        qnt: newQnts.qnt,
        price: newQnts.price,
        action:'ادخال',
        type:'منتح نهائي',
    })
    return newDocument       
}

export async function editMinusProduct(name,newQnt,note,option){
   
    const firstQnt = newQnt
    let result = await ProductsStorage.findOne({name:name});
    
    console.log(result)

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
        if (option !== undefined && qnts[i].option === option) {
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
        option: item.option
    }));

    // Save the updated qnts array back to the database
    result.qnts = qnts;
    
    

    const newDocument = await ProductsStorage.findOneAndUpdate({name:name}, result, { new: true })
    AddToArchive({
        name,
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

