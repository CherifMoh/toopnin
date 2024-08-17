'use client'

import axios from "axios"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { setOtp } from "../../../app/redux/features/otp/otpSlice"
import { sendOtpEmil } from "../../../app/actions/users"
import { setEmail } from "../../../app/redux/features/email/emailSlice"

function UserForm() {
    const router = useRouter()
    const [formData, setFormData] = useState({})
    const [errorMessage, setErrorMessage] = useState('')

    const dispatch = useDispatch()


    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    };

    async function handleOTP() {
        if(!formData.email || !validateEmail(formData.email)) {
            setErrorMessage('Invalid email address');
            return
        }
        const OTP = Math.floor(Math.random() * 9000 + 1000);
        dispatch(setOtp(OTP))
        dispatch(setEmail(formData.email))
        const res = await sendOtpEmil(formData.email, OTP)
        setErrorMessage(res.message);
        if(res.message === 'OTP sent successfully') {

            router.push('/login/forgotPassword')
        }
        
    }

    const handleChange = (e) => {
        const value = e.target.value
        const name = e.target.name
        setFormData(preState => ({
            ...preState,
            [name]: value
        }))
    }

    const handelSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        try {
            const res = await axios.post('/api/auth/login', formData)
            console.log(res.data.message)
            router.refresh()
            router.push('/admin')
        } catch (err) {
            console.log(err)
            setErrorMessage(err.message)
        }

    }
    return (
        <div className="flex flex-col shadow-md justify-center gap-5 items-center w-96 h-[500px] bg-white">
            <h1
                className="text-2xl font-bold p-4"
            >
                Login
            </h1>
            <form
                onSubmit={handelSubmit}
                method="POST"
                className="flex flex-col w-full items-center gap-3"
            >
                <input
                    type="text"
                    name="email"
                    placeholder="E-mail"
                    onChange={handleChange}
                    required
                    defaultValue={formData.email}
                    className="m-2 px-3 py-2 border w-72 border-gray-400 rounded"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                    defaultValue={formData.password}
                    className="m-2 px-3 py-2 border w-72 border-gray-400 rounded"
                />

                <button
                    type='submit'
                    className="w-72 bg-blue-500 text-white py-3 rounded"
                >
                    LogIn
                </button>
            </form>
            <div 
                className="text-blue-500 cursor-pointer"
                onClick={handleOTP}
            >
                Forgot password ?
            </div>
            <p className="text-red-500">{errorMessage}</p>
        </div>
    )
}

export default UserForm