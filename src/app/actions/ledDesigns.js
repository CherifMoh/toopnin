'use server'

import { dbConnect } from "../lib/dbConnect"
import Design from "../models/design"

export async function addDesign(formData){
    await dbConnect()

    Design.create(formData)
}

export async function getAllDesigns(){
    await dbConnect()

    const AllDesigns = await Design.find()

    return AllDesigns
}

export async function getDesignById(id){
    await dbConnect()

    const design = await Design.findOne({_id:id})

    if(!design){
        return 'Design not found'
    }else{
        return design
    }
    
}