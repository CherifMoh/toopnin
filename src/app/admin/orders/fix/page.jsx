"use client"

import { useState } from "react"
import { updateByDLVTracking, updateByNumber } from "../../../actions/order"

function Fix() {

    const [method, setMethod] = useState("phone")
    const [track, setTrack] = useState("")
    const [state, setState] = useState("")
    const [error, setError] = useState("")

    function checkPhone(phone) {
        // Ensure the phone is a string
        if (typeof phone !== "string") {
            return false;
        }
    
        // Convert the phone to a number
        const numericPhone = parseInt(phone, 10);
    
        // Check if the conversion resulted in NaN or the first digit is not 0
        if (isNaN(numericPhone) || !phone.startsWith("0")) {
            return false;
        }
    
        // Validate the phone number pattern
        const phonePattern = /^0\d{9}$/;
        return phonePattern.test(phone);
    }
    

    function handleSubmit(e) {
        e.preventDefault()
        if(method === "phone" && !checkPhone(track)) return setError('Please enter a valid phone number')
        if(!track) return setError('Please enter a phone number or a tracking')
        if(method === "phone") updateByNumber(track, state)
        if(method === "traking") updateByDLVTracking(track, state)
        setError('')
        
    }

    
  return (
    <main className="w-full h-screen pt-20">
        <form onSubmit={handleSubmit} className="p-6 max-w-md mx-auto bg-[#F5F5F5] shadow-md rounded-md space-y-4">
            <div className="flex items-center space-x-4">
                <div>
                    <input 
                        defaultChecked 
                        type="radio" 
                        name="method" 
                        id="phone" 
                        className="peer hidden" 
                        onClick={() => setMethod("phone")} 
                    />
                    <label 
                        htmlFor="phone" 
                        className="cursor-pointer py-2 px-4 border rounded-md peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition"
                        onClick={() => setMethod("phone")}
                    >
                        Phone
                    </label>
                </div>
                <div>
                    <input 
                        type="radio" 
                        name="method" 
                        id="traking" 
                        className="peer hidden" 
                        onClick={() => setMethod("traking")} 
                    />
                    <label 
                        htmlFor="traking" 
                        className="cursor-pointer py-2 px-4 border rounded-md peer-checked:bg-blue-500 peer-checked:text-white peer-checked:border-blue-500 transition"
                        onClick={() => setMethod("traking")}
                    >
                        Tracking
                    </label>
                </div>
            </div>

            <div>
                <input 
                    type="text" 
                    onChange={(e) => setTrack(e.target.value)}
                    placeholder="Phone or Tracking" 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <select 
                    onChange={(e) => setState(e.target.value)} 
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="" hidden selected>
                        Select State
                    </option>
                    <option value='غير مؤكدة'>غير مؤكدة</option>
                    <option value="En preparation">En préparation</option>
                    <option value="Prêt à expédier">Prêt à expédier</option>
                    <option value="Prêt à expédier L">Prêt à expédier L</option>
                    <option value="Dispatcher">Dispatcher</option>
                    <option value="Au Bureau">Au Bureau</option>
                    <option value="Annuler par le Client">Annuler par le Client</option>
                    <option value="En livraison">En livraison</option>
                    <option value="Livrée">Livrée</option>
                    <option value="Retour Navette">Retour Navette</option>
                    <option value="Retour de Dispatche">Retour de Dispatché</option>
                    <option value="Retour Client">Retour Client</option>
                    <option value="1 لم يرد">1 لم يرد</option>
                </select>

            </div>
            <div className="text-red-500 text-center">
                {error}
            </div>
            <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
                Save
            </button>
        </form>

    </main>
  )
}

export default Fix