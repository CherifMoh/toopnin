'use client'
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Spinner from "../../../../../components/loadings/Spinner"
import { createRole, updateRole } from "../../../../actions/users"
import axios from "axios"
import { useQuery } from "@tanstack/react-query"

async function fetchRole(id) {
    const res = await axios.get(`/api/users/roles/${id}`);
    return res.data;
  }

function Page({ params }) {

    const { data: Role, isLoading, isError, error: fetchError } = useQuery({
        queryKey: ['role by id'],
        queryFn: ()=>fetchRole(params.roleId)
    });

    const [accessGategory, setAccessGategory] = useState('orders')

    const [isSaving, setIsSaving] = useState(false)

    const [error, setError] = useState()

    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
        accessibilities: []
    })

    const router = useRouter()

    useEffect(()=>{
        if(!Role) return
        let newrole = {...Role}
        delete newrole._id;
        delete newrole.createdAt;
        delete newrole.updatedAt;
        delete newrole.__v;
        setNewRole(newrole)
    },[Role])


    if(isLoading) return <div>Loading ...</div>
    if(isError) return <div>{fetchError.message}</div>

    console.log(newRole)

    const accessibilities = newRole.accessibilities


    function handleAccessibilitiesChange(e) {
        const updatedAccessibilities = [...accessibilities]
        const index = updatedAccessibilities.findIndex(item => item.name === accessGategory)
        if (index > -1) {
            const selectedAccessibilities = updatedAccessibilities[index].accessibilities
            if (selectedAccessibilities.includes(e.target.name)) {
                updatedAccessibilities[index].accessibilities = selectedAccessibilities.filter(access => access !== e.target.name)
            } else {
                updatedAccessibilities[index].accessibilities.push(e.target.name)
            }
        } else {
            updatedAccessibilities.push({ name: accessGategory, accessibilities: [e.target.name] })
        }
        setNewRole(prev => ({
            ...prev,
            accessibilities: updatedAccessibilities
        }))
    }

    function handleChange(e){
        const name = e.target.name
        const value = e.target.value
        setNewRole(prev => ({
            ...prev,
            [name]: value
        }))
    }

    async function handleSubmit(e){
        setIsSaving(true)
        try{
            const res = await updateRole(Role._id,newRole)
            router.refresh()
            router.push('/admin/users')
        }catch(error){
            setError(error.message)
        }
        setIsSaving(false)
    }

    const actions = [
        'create', 'read', 'update', 'delete'
    ]
    const actionsElements = actions.map((action, idx) => {
        const isChecked = newRole.accessibilities.find(item => item.name === accessGategory)?.accessibilities.includes(action) || false
        return (
            <div key={idx} className="flex gap-2 items-center">
                <input
                    type="checkbox"
                    className='cursor-pointer'
                    name={action}
                    id={action}
                    onChange={handleAccessibilitiesChange}
                    checked={isChecked}
                />
                <label
                    htmlFor={action}
                    className='capitalize tracking-wider font-medium'
                >
                    {action}
                </label>
            </div>
        )
    })

    const categories = [
        'orders', 'products', 'users', 'storage'
    ]
    const categoriesElements = categories.map((category, idx) => {
        return (
            <div
                key={idx}
                className={`w-1/4 text-center py-6 font-semibold ${accessGategory === category ? 'bg-slate-50 border-t-4 border-blue-500' : 'bg-slate-200 cursor-pointer'}`}
                onClick={() => setAccessGategory(category)}
            >
                {category}
            </div>
        )
    })

    return (
        <main className="p-4">
            <div className='flex justify-between items-center p-4'>
                <div>
                    <h1 className='text-3xl font-semibold'>
                        Add a Role
                    </h1>
                    <h4 className='text-sm'>
                        Create a new role and its accessibility
                    </h4>
                </div>
                <div>{error}</div>
                <div className="flex gap-6">
                    <button 
                        className="rounded text-gray-400 border border-gray-400 px-6 py-2"
                        onClick={() => setNewRole({name: '', description: '', accessibilities: []})}
                    >
                        Reset
                    </button>
                    <button 
                        className="rounded border relative border-green-600 bg-green-600 text-white px-20 py-2"
                        onClick={handleSubmit}
                    >
                        {isSaving
                        ?<Spinner color='border-white' size={'size-7'} containerStyle={'mb-7 mr-7'} />
                        :'Save'
                        }
                    </button>
                </div>
            </div>
            <div className="m-4 p-8 bg-slate-50 shadow-md flex justify-between gap-12">
                <div className="flex flex-col flex-grow">
                    <label
                        htmlFor="name"
                        className="self-start mb-2 font-bold tracking-wider"
                    >
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={newRole.name}
                        name="name"
                        placeholder="Name of the role"
                        onChange={handleChange}
                        className="w-full border border-gray-400 px-4 py-2 bg-transparent rounded"
                    />
                </div>
                <div className="flex flex-col flex-grow">
                    <label
                        htmlFor="description"
                        className="self-start mb-2 font-bold tracking-wider"
                    >
                        Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={newRole.description}
                        placeholder="Description"
                        onChange={handleChange}
                        className="w-full border border-gray-400 px-4 py-2 bg-transparent rounded"
                    />
                </div>
            </div>
            <div className="m-4 bg-slate-50 shadow-md flex flex-col justify-between gap-12">
                <div className="flex justify-between w-full">
                    {categoriesElements}
                </div>
                <div className="flex justify-between p-8 w-3/4 mx-auto">
                    {actionsElements}
                </div>
            </div>
        </main>
    )
}

export default Page
