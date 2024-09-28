'use server'

import Wilayas from "../models/wilayas"
import { dbConnect } from "../lib/dbConnect"
import * as xlsx from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import axios from "axios";

export async function updateWilayas(wilayat,fees,communes){
    
    try{
        await dbConnect()
        
        // const oldWilayas = await Wilayas.find()

        const newWilayas = {
            wilayas:wilayat,
            fees:fees,
            communes:communes
        }
        // console.log(newWilayas)

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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ConvertCommuneToJSON() {
  // Load the XLSX file
  const filePath = path.resolve('G:/Cherif/web dev/Toopnin/src/app/data/Commune.xlsx');

  try {
    // Read file asynchronously
    const data = await fs.readFile(filePath);

    // Read it as an XLSX file
    const workbook = xlsx.read(data, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Create the array of objects with nom: Commune, wilaya_id: IDWilaya
    const result = jsonData.map((row) => ({
      nom: row.Commune, // Change this if your original keys differ
      wilaya_id: row.IDWilaya, // Change this if your original keys differ
    }));

    // Log or return the result
    console.log(result);
    return result;
  } catch (err) {
    console.error(`Error reading file: ${err}`);
    return null;
  }
}

export async function getTrafication() {
  try{
    const response = await axios.post('https://procolis.com/api_v1/tarification ', 
      {},
      {
          headers: {
              key: process.env.ZR_API_KEY,
              token: process.env.ZR_API_TOKEN
          }
      }
    );
   
   
    const tarification = response.data;

    

    const result = {
      livraison: tarification.map((entry) => ({
        wilaya_id: entry.IDWilaya,          // Integer field for Wilaya ID
        tarif: parseInt(entry.Domicile),    // String to integer conversion for tarif
        tarif_stopdesk: parseInt(entry.Stopdesk),     // String for tarif_stopdesk
        annuler: parseInt(entry.Annuler)    // String to integer conversion for annuler
      }))
    };

    return result
  }catch(err){
      console.log(err.message)
      return null
  }
}

export async function getWilayas() {
  try{
    const response = await axios.post('https://procolis.com/api_v1/tarification ', 
      {},
      {
          headers: {
              key: process.env.ZR_API_KEY,
              token: process.env.ZR_API_TOKEN
          }
      }
    );
   
   
    const tarification = response.data;

    

    const result = tarification.map(item => ({
      wilaya_id: item.IDWilaya,       // Renaming IDWilaya to wilaya_id
      wilaya_name: item.Wilaya,       // Renaming Wilaya to wilaya_name
    }));

    return result
  }catch(err){
      console.log(err.message)
      return null
  }
}

