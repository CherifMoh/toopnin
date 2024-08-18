'use server'

import Wilayas from "../models/wilayas"
import { dbConnect } from "../lib/dbConnect"


export async function updateWilayas(wilayat,fees,communes){
    
    try{
        await dbConnect()
        
        // const oldWilayas = await Wilayas.find()

        const newWilayas = {
            wilayas:wilayat,
            fees:fees,
            communes:communes
        }

        // if(!oldWilayas){
            await Wilayas.create(newWilayas)
        // }else{
        //     Wilayas.findByIdAndUpdate(oldWilayas._id,newWilayas)
        // }

       
        console.log("Wilayas Updated")
    
        return "Wilayas Updates " + newWilayas
    
      }catch(err){
        return "Error :" + err
      } 
}

