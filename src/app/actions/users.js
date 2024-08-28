'use server'

import User from "../models/users"
import Role from "../models/roles"
import { dbConnect } from "../lib/dbConnect"
import { cookies } from "next/headers"
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt'

// export async function addUser(formData) {
//     await dbConnect()
//     Order.create(formData)
// }

export async function deleteUser(id) {
    await dbConnect()
    const res = await User.findByIdAndDelete(id)
}

export async function getUserNameByEmail(email) {
    await dbConnect()
    const res = await User.findOne({ email: email }).select('name')

    return res.name
}

export async function editeUserPfp(email, pfp) {
    await dbConnect();

    if (!pfp) return;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { pfp: pfp } },
            { new: true }
        );

        return updatedUser;
    } catch (error) {
        console.error("Error updating user profile picture:", error);
        throw error;
    }
}

export async function editeUserPassword(email, password) {
    await dbConnect();

    if (!password) return;

    try {
        const hashPassword = await bcrypt.hash(password, 10)
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { password: hashPassword } },
            { new: true }
        );

        return updatedUser;
    } catch (error) {
        console.error("Error updating user profile picture:", error);
        throw error;
    }
}

export async function createRole(newRole) {

    await dbConnect();

    try {
        await Role.create(newRole);
        
        return 'created';
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
}

export async function deleteRole(id) {
    

    try {
        await dbConnect();

        await Role.findByIdAndDelete(id);

        return 'deleted';
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
}

export async function updateRole(id,newRole) {
    

    try {
        await dbConnect();

        await Role.findByIdAndUpdate(id,newRole,{new:true});

        return 'updated';
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
}

export async function dleleteCookies() {
    cookies().delete('access-token')
    cookies().delete('user-email')
}

export async function checkEmail(email) {

    try{
        await dbConnect();
        const user = await User.findOne({ email: email });

        if(user)return true

        return false
    }catch (error) {
        console.error("Failed to send OTP");
        throw error;
    }
      
}

export async function sendOtpEmil(email, otp) {
    try {
        if(!await checkEmail(email)){
            return { message: 'Invalid email address'}
        }
        // Create a transporter object
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user:  process.env.MY_EMAIL, // Replace with your email
            pass: process.env.MY_PASSWORD, // Replace with your email password
          },
          tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false,
          },
        });
    
        // Set up email data
        const mailOptions = {
          from:  process.env.MY_EMAIL, // Replace with your name and email
          to: email,
          subject: 'Your OTP Code',
          text: `Your OTP code is: ${otp}`,
          html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
        };
    
        // Send the email
        await transporter.sendMail(mailOptions);
    
        return { message: 'OTP sent successfully' };
      } catch (error) {
        console.error(error);
        return { message: 'Failed to send OTP', error: error.message };
      }
}
