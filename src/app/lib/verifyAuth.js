import { jwtVerify } from "jose"


async function verifyAuth(token) {
 try{
    const verified = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_KEY))
    return verified.payload
   }catch(err){
    throw new Error( err)
 }
}

export default verifyAuth