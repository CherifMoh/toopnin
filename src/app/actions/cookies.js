'use server'

import { cookies } from "next/headers"

export async function CreateUnVisitor(){
    const thirtyDaysFromNow = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
    cookies().set("unVisit", true, {
        path: "/",
        domain: "localhost",
        maxAge: thirtyDaysFromNow,
        httpOnly: true,
        secure: false,
    })
}
export async function setBlockedIP(){
    cookies().set("ipBlocked", true, {
        path: "/",
        domain: "toopnin.com",
        maxAge: 10 * 365 * 24 * 60 * 60, // 10 years in seconds
        httpOnly: true,
        secure: true,
    });
}