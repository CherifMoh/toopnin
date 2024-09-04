'use server'

import { cookies } from "next/headers"
import PixelID from "../models/pixel"
import { dbConnect } from "../lib/dbConnect"

export async function addPixel(pixelID){ 
  try {
      await dbConnect(); // Connect to the database

      const existingPixel = await PixelID.findOne({ pixelID: pixelID }); // Check if the pixel already exists

      if (existingPixel) {
          console.log('Pixel ID already exists:', existingPixel);
      } else {
          const newPixel = await PixelID.create({ pixelID: pixelID }); // Create a new pixel if it doesn't exist
          console.log('New Pixel ID created:', newPixel);
      }
  } catch (err) {
      console.log(err);
  }
}

export async function deletePixel(id){
    try{
  
      await dbConnect()
      const res = await PixelID.findByIdAndDelete(id)       
      
    }catch(err){
      console.log(err)
    }
  }
  