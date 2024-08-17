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