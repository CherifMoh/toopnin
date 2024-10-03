"use client"

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { ConvertCommuneToJSON, updateWilayas } from "../../../actions/wilayas";


async function fetchWilayt() {
    const res = await axios.get('/api/wilayas/wilayasCodes');
    return res.data.wilayas;
}
async function fetchFees() {
    const res = await axios.get('/api/wilayas/fees');
    return res.data.fees;
}

function Fees() {

    const { data: fees, isLoading: feesLoding, isError: feesIsErr, error: feesErr } = useQuery({
        queryKey: ['fees'],
        queryFn: fetchFees
    });

    const { data: wilayat, isLoading: wilayatLoding, isError: wilayatIsErr, error: wilayatErr } = useQuery({
        queryKey: ['wilayat'],
        queryFn: fetchWilayt
    });

    const [newFees, setNewFees] = useState({});

    useEffect(() => {
        if(!fees) return;
        setNewFees(fees)
    }, [fees])

    if (wilayatLoding || feesLoding) return <div>Loading...</div>;
    if (wilayatIsErr) return <div>Error: {wilayatErr.message}</div>;
    if (feesIsErr) return <div>Error: {feesErr.message}</div>;

    function getWilayaName(id) {
        const wilaya = wilayat.find(wilaya => wilaya.wilaya_id === id);
        return wilaya.wilaya_name;
    }

    const tBodyEle = newFees?.livraison?.map((fee, i) => {
        return (
            <tr key={fee.wilaya_id}>
                <td className='whitespace-nowrap w-1/3'>{getWilayaName(fee.wilaya_id)}</td>
                <td>
                    <input
                        type="number"
                        className="no-focus-outline"
                        value={fee.tarif}
                        onChange={(e) => {
                            const updatedFees = [...newFees.livraison];
    
                            // Update the specific tarif value
                            updatedFees[i].tarif = Number(e.target.value);
                            
                            // Set the new fees state with the updated fees
                            setNewFees(prevState => ({
                                ...prevState,
                                livraison: updatedFees,
                            }));
                        }}
                    />
                </td>
                <td>
                    <input
                        type="number"
                        className="no-focus-outline"
                        value={fee.tarif_stopdesk}
                        onChange={(e) => {
                            const updatedFees = [...newFees.livraison];
    
                            // Update the specific tarif_stopdesk value
                            updatedFees[i].tarif_stopdesk = Number(e.target.value);
                            
                            // Set the new fees state with the updated fees
                            setNewFees(prevState => ({
                                ...prevState,
                                livraison: updatedFees,
                            }));
                        }}
                    />  
                </td>
            </tr>
        )
    })

    async function handleSave(){
        const commune = await ConvertCommuneToJSON();
        updateWilayas(wilayat, newFees, commune)
    }

  return (
    <main className="w-full pt-4 relative">
        <button 
            className="fixed rounded-lg top-10 text-lg right-20 text-white bg-green-500 px-4 py-2"
            onClick={handleSave}
        >
            Save
        </button>
        <table className="w-1/3 mx-auto">
            <thead>
                <tr>
                    <th>ولاية</th>
                    <th>بيت</th>
                    <th>مكتب</th>
                </tr>
            </thead>
            <tbody>
                {tBodyEle}
            </tbody>
        </table>
    </main>
  )
}

export default Fees