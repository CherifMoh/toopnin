'use client'

import { faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { editeUserPassword } from "../../../app/actions/users"
import { useRouter } from "next/navigation"

function ResetPass() {

  const [password, setPassword] = useState('')

  const [confPassword, setConfPassword] = useState('')
  
  const [isConfPassword, setIsConfPassword] = useState(false)

  const [isPassword, setIsPassword] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')

  const EMAIL = useSelector((state) => state.email.email)

  const router = useRouter()

  useEffect(() => {
    if(!EMAIL){
      router.push('/login')
    }
  }, []);


  function togglePassword(){
    setIsPassword(pre=>!pre)
  }
  function toggleConfPassword(){
    setIsConfPassword(pre=>!pre)
  }

  function changePassword(){

    if(password !== confPassword){
      return setErrorMessage('Passwords do not match')
    }
    try{
      editeUserPassword(EMAIL, password)
      router.push('/login')
    }catch(err){
      setErrorMessage(err.message)
    }

  }  
  return (
    <div>
      <section className="bg-gray-50 w-screen dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="w-full p-6 bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md dark:bg-gray-800 dark:border-gray-700 sm:p-8">
            <h2 className="mb-1 text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Change Password
            </h2>
            <form className="mt-4 space-y-4 lg:mt-5 md:space-y-5">
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  New Password
                </label>
                <input
                  type={isPassword?'text':"password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) =>{
                    setPassword(e.target.value)
                    setErrorMessage('')
                  }}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                ></input>
                <FontAwesomeIcon 
                  icon={isPassword?faEye:faEyeSlash} 
                  className="text-white absolute top-1/2 right-3 translate-y-1/2 cursor-pointer"
                  onClick={togglePassword}
                />
              </div>
              <div className="relative">
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm password
                </label>
                <input
                  type={isConfPassword?'text':"password"}
                  name="confirm-password"
                  id="confirm-password"
                  value={confPassword}
                  onChange={(e) =>{
                    setConfPassword(e.target.value)
                    setErrorMessage('')
                  }}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                ></input>
                <FontAwesomeIcon 
                  icon={isConfPassword?faEye:faEyeSlash}  
                  className="text-white absolute top-1/2 right-3 translate-y-1/2 cursor-pointer"
                  onClick={toggleConfPassword}
                />
              </div>
            
            </form>
            <button
              onClick={changePassword}
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Reset passwod
            </button>
            <p className="text-red-500 text-center">{errorMessage}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ResetPass