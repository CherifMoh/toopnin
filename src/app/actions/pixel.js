'use server'

import { cookies } from "next/headers"
import FBPixelID from "../models/FBpixel"
import TikTokPixelID from "../models/TikTokpixel"
import { dbConnect } from "../lib/dbConnect"

export async function addFBPixel(pixelID){ 
  try {
      await dbConnect(); // Connect to the database

      const existingPixel = await FBPixelID.findOne({ pixelID: pixelID }); // Check if the pixel already exists

      if (existingPixel) {
          console.log('Pixel ID already exists:', existingPixel);
      } else {
          const newPixel = await FBPixelID.create({ pixelID: pixelID }); // Create a new pixel if it doesn't exist
          console.log('New Pixel ID created:', newPixel);
      }
  } catch (err) {
      console.log(err);
  }
}


export async function deleteFBPixel(id){
    try{
  
      await dbConnect()
      const res = await FBPixelID.findByIdAndDelete(id)       
      
    }catch(err){
      console.log(err)
    }
}
export async function addTikTokPixel(pixelID){ 
  try {
      await dbConnect(); // Connect to the database

      const existingPixel = await TikTokPixelID.findOne({ pixelID: pixelID }); // Check if the pixel already exists

      if (existingPixel) {
          console.log('Pixel ID already exists:', existingPixel);
      } else {
          const newPixel = await TikTokPixelID.create({ pixelID: pixelID }); // Create a new pixel if it doesn't exist
          console.log('New Pixel ID created:', newPixel);
      }
  } catch (err) {
      console.log(err);
  }
}


export async function deleteTikTokPixel(id){
    try{
  
      await dbConnect()
      const res = await TikTokPixelID.findByIdAndDelete(id)       
      
    }catch(err){
      console.log(err)
    }
}
  