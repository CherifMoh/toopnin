'use client'
import { useState } from 'react'
import OTPinput from '../../../components/admin/auth/OTPinput'
import ResetPass from '../../../components/admin/auth/ResetPass'

function ForgotPassword() {

  const [isCorrectOTP, setIsCorrectOTP] = useState(false)
  
  return (
    <>
      {isCorrectOTP
        ?<ResetPass />
        :<OTPinput setIsCorrectOTP={setIsCorrectOTP} />
      }
    </>
  )
}

export default ForgotPassword