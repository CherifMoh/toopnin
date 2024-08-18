import { NextResponse } from 'next/server'
import verifyAuth from './app/lib/verifyAuth'
import { decodeJwt } from 'jose';
import axios from 'axios'
import { cookies } from 'next/headers'
import { CreateUnVisitor } from './app/actions/cookies'





export default async function middleware(request) {

    const fullPath = request.nextUrl.pathname
    const parts = fullPath.split("/")
    const path = parts[1]


    const accessCookie = request.cookies.get('access-token')

    let decodedToken

    if (accessCookie) decodedToken = decodeJwt(accessCookie.value);


    if (fullPath === '/') {
        return NextResponse.redirect(new URL('/store', request.url));
    }

    if (parts.length === 2) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    if (path === 'admin') {
        try {
            if (!accessCookie) return NextResponse.redirect(new URL('/login', request.url))
            const token = accessCookie.value
            const verifiedToken = token && await verifyAuth(token)
            if (!verifiedToken) return NextResponse.redirect(new URL('/login', request.url))
            return NextResponse.next()
        }
        catch (err) {
            console.log('Eroro: ', err)
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }


}


export const config = {
    matcher: ['/admin/:path*', '/'],
}