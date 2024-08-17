"use client"
import axios from "axios";
import { useRouter } from "next/navigation"
import { useState } from "react"





function Categoryadd() {
    typeof document !== 'undefined' && document.body.classList.add('bg-white')

    const router = useRouter()
    const [formData, setFormData] = useState({})
    const [errorMessage, setErrorMessage] = useState('')

    const handleChange =(e)=>{
        const value = e.target.value
        const name = e.target.name
        setFormData(preState=>({
            ...preState,
            [name]:value
        }))
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        setErrorMessage('')
        try{
            const res = await axios.post('/api/category',formData)
            router.refresh()
            router.push('/admin/categoreis')
        }catch(err){
            console.log(err)
            setErrorMessage(err.message)
        }

    }

  return (
    <div className="h-screen w-full p-20">
        <h1 className="text-center text-2xl font-semibold mb-20">
            Add a category
        </h1>
        <form onSubmit={handleSubmit} className="flex-col flex gap-8" >
            <input className="bg-gray-200 border-2 border-gray-300 focus:border-black"  type="text" onChange={handleChange} name="name" placeholder="name"/>
            <button type="submit" className="p-4 bg-gray-800 text-white w-full">Submit</button>
        </form>
        <p className="text-red-500">{errorMessage}</p>
    </div>
  )
}

export default Categoryadd