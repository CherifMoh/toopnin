import { NextResponse } from 'next/server'
import User from '../../models/users'
import bcrypt from 'bcrypt'
import {dbConnect} from '../../lib/dbConnect'


export async function GET(req){
    try{
        await dbConnect()
        return User.find().sort({_id: -1})
            .then(result=> Response.json(result))
            .catch(err=>Response.json({message:err.message}))
      }catch(err){
        return new NextResponse("Error :" + err)
      }
    
}
export async function POST(req){
    await dbConnect()
    try{
        const body = await req.json()
        console.log(body)
        const userData = body


        //Confirm data exists
        if(!userData?.email || !userData?.password){
            return NextResponse.json(
                {message: 'All fields are requred '},
                {status:400}
            )
        }

        //check for duplicated emails
        const duplicated = await User.findOne({email: userData.email}).lean().exec()

        if(duplicated){
            return NextResponse.json(
                {message: 'Auth Failed'},
                {status:409}
            )
        }

        const hashPassword = await bcrypt.hash(userData.password, 10)
        userData.password = hashPassword

        await User.create(userData)
        return NextResponse.json({message: 'User created'},{status:201})

    }catch(err){
        console.log(err)
        return NextResponse.json({message: 'Error ', err},{status:500})
    }
}