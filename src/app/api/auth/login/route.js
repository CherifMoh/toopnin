import { NextResponse } from 'next/server'
import User from '../../../models/users'
import {dbConnect} from '../../../lib/dbConnect'
import bcrypt from 'bcrypt'
import {SignJWT} from 'jose'
import { cookies } from "next/headers";
import { nanoid } from 'nanoid'


export async function POST(req){
    await dbConnect()
    const body = await req.json()
    const user = await User.findOne({email:body.email})

    const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

    if(!user){
        return NextResponse.json({message:'auth failed'},{status:409})
    }else{
        try {

            const match = await bcrypt.compare(body.password, user.password);
            if(match) {
                const token = await new SignJWT({
                    email:user.email,
                    role:user.role
                })
                .setProtectedHeader({alg: 'HS256'})
                .setJti(nanoid())
                .setIssuedAt()
                .setExpirationTime(thirtyDaysFromNow)
                .sign(new TextEncoder().encode(process.env.JWT_KEY))

                cookies().set("user-email", user.email, {
                    path: "/",
                    domain: "localhost",
                    maxAge: thirtyDaysFromNow,
                    httpOnly: true,
                    secure: true,
                });


                cookies().set("access-token", token, {
                    path: "/",
                    domain: "localhost",
                    maxAge: thirtyDaysFromNow,
                    httpOnly: true,
                    secure: true,
                });
                return Response.json({message: 'Logged in'}, {status: 201});
            } else {
                return NextResponse.json({message: 'Authentication failed'}, {status: 409});
            }
        } catch(err) {
            console.log('bcrypt Error', err);
            return NextResponse.json({message: 'bcrypt Error', err}, {status: 500});
        }
    }
    
}


