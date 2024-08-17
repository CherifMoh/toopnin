'use client'

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { setEmail } from "../../../app/redux/features/email/emailSlice";

function OTPinput({setIsCorrectOTP}) {

    const [otp, setOtp] = useState('');
    
    const [timerCount, setTimerCount] = useState(0);
    
    const [disable, setDisable] = useState(true);

    const [errorMessage, setErrorMessage] = useState('')

    const OTP = useSelector((state) => state.otp.otp)
    const EMAIL = useSelector((state) => state.email.email)
    
    const inputsRef = useRef([]);
  
    const dispatch = useDispatch()

    const router = useRouter()

    useEffect(() => {
        if(timerCount === 5)setDisable(false)

        return ()=>setDisable(true)
    }, [timerCount]);

    useEffect(() => {
        const interval = setInterval(() => {
          setTimerCount((pre) => pre + 1/2);
        }, 1000);

        setTimeout(() => {
            clearInterval(interval)
        }, 5000)
    
        return () => {
          // clearInterval(interval);
        };
    }, []);

    useEffect(() => {
      if(!EMAIL ||!OTP){
        router.push('/login')
      }
    }, []);


    function verfiyOTP(){
        if(Number(otp) === OTP) {
            setIsCorrectOTP(true)
        }else{
            console.log('wrong OTP')
        }

    }

    const validateEmail = (email) => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    };

    async function reSendOTP() {
      if(!EMAIL || !validateEmail(EMAIL)) {
          setErrorMessage('Invalid email address');
          return
      }
      const otp = Math.floor(Math.random() * 9000 + 1000);
      dispatch(setOtp(otp))
      dispatch(setEmail(EMAIL))
      const res = await sendOtpEmil(formData.email, otp)
      setErrorMessage(res.message);
      if(res.message === 'OTP sent successfully') {

          router.push('/login/forgotPassword')
      }
      
  }

    const handlePaste = (event) => {
      event.preventDefault();
      const pasteData = (event.clipboardData || window.clipboardData).getData('text');

      const otpChars = pasteData.split('').slice(0, 4); // Get the first 4 characters

      setOtp(otpChars.join(''));
  
      otpChars.forEach((char, index) => {
        if (inputsRef.current[index]) {
          inputsRef.current[index].value = char;
        }
      });
    };

    const handleChange = (index, value) => {
        const updatedOtp = otp.split('');
        updatedOtp[index] = value;
        setOtp(updatedOtp.join(''));
      };

    const inputsElement = [0, 1, 2, 3].map((_, index) => (
        <div key={index} className="w-16 h-16">
          <input
            ref={(el) => (inputsRef.current[index] = el)}
            maxLength="1"
            className="w-full h-full flex flex-col items-center justify-center text-center px-5 outline-none rounded-xl border border-gray-200 text-lg bg-white focus:bg-gray-50 focus:ring-1 ring-blue-700"
            type="text"
            onPaste={index === 0 ? handlePaste : null} // Only attach paste event to the first input
            onChange={(e) => handleChange(index, e.target.value)}
          />
        </div>
      ))


  return (
    <div className="flex justify-center items-center w-screen h-screen bg-gray-50">
        <div className="bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
        <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
            <div className="flex flex-col items-center justify-center text-center space-y-2">
            <div className="font-semibold text-3xl">
                <p>Email Verification</p>
            </div>
            <div className="flex flex-row text-sm font-medium text-gray-400">
                <p>We have sent a code to your email {EMAIL} </p>
            </div>
            </div>

            <div>
            <form>
                <div className="flex flex-col space-y-16">
                <div className="flex flex-row items-center justify-between mx-auto w-full max-w-xs">
                   {inputsElement}
                </div>

                <div className="flex flex-col space-y-5">
                    <div>
                    <a
                        onClick={verfiyOTP}
                        className="flex flex-row cursor-pointer items-center justify-center text-center w-full border rounded-xl outline-none py-5 bg-blue-700 border-none text-white text-sm shadow-sm"
                    >
                        Verify Account
                    </a>
                    </div>

                    <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                    <p>Didn&apos;t recieve code?</p>
                    <a
                        className="flex flex-row items-center"
                        style={{
                        color: disable ? "gray" : "blue",
                        cursor: disable ? "none" : "pointer",
                        textDecorationLine: disable ? "none" : "underline",
                        }}
                        onClick={() => reSendOTP()}
                    >
                        {disable ? `Resend OTP in ${timerCount}s` : "Resend OTP"}
                    </a>
                    </div>
                </div>
                </div>
            </form>
            </div>
        </div>
        </div>
    </div>
  )
}

export default OTPinput