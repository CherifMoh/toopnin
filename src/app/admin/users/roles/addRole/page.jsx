'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import Spinner from "../../../../../components/loadings/Spinner"
import { createRole } from "../../../../actions/users"

function Page() {

    const [accessGategory, setAccessGategory] = useState('orders')

    const [isSaving, setIsSaving] = useState(false)

    const [error, setError] = useState()

    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
        accessibilities: []
    })

    const accessibilities = newRole.accessibilities

    const router = useRouter()

    function handleAccessibilitiesChange(e) {

        const name = e.target.name
        const updatedAccessibilities = [...accessibilities]

        const index = updatedAccessibilities.findIndex(item => item.name === accessGategory)
        

        if (index > -1) {
            const selectedAccessibilities = updatedAccessibilities[index].accessibilities
            if(name === 'read' && (selectedAccessibilities.includes('delete') || selectedAccessibilities.includes('update'))){
                
            }
            else if (selectedAccessibilities.includes(name)) {
                updatedAccessibilities[index].accessibilities = selectedAccessibilities.filter(access => access !== e.target.name)
            } else {
                if(!selectedAccessibilities.includes('read') && (name === 'delete' || name === 'update')){
                    updatedAccessibilities[index].accessibilities.push('read')
                }
                updatedAccessibilities[index].accessibilities.push(name)
            }
        } else {
            if(name === 'delete' || name === 'update'){
                updatedAccessibilities.push({ name: accessGategory, accessibilities: [name,'read'] })
            }else{
                updatedAccessibilities.push({ name: accessGategory, accessibilities: [name] })
            }
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
            const res = await createRole(newRole)
            router.refresh()
            router.push('/admin/users')
        }catch(error){
            setError(error.message)
        }
        setIsSaving(false)
    }

    let actionsElements = []
  

    const categories = [
        {
            name: 'Products',
            actions:[
                'create', 'read', 'update', 'delete','storage',
            ]
        },
        {
            name: 'orders',
            actions:[
                'create', 'read', 'update', 'delete', 'excel',
                'archive', 'IP block'
            ]
        },
        {
            name: 'users',
            actions:[
                'create', 'read', 'update', 'delete'
            ]
        },
        {
            name: 'online',
            actions:[
                'create', 'read', 'delete'
            ]
        },
    ]

    const categoriesElements = categories.map((category, idx) => {
        const isSelected = accessGategory === category.name 
        if(isSelected){

            actionsElements = category.actions.map((action, idx) => {
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
        }
        return (
            <div
                key={idx}
                className={`w-1/4 flex-grow text-center py-6 font-semibold ${isSelected? 'bg-slate-50 border-t-4 border-blue-500' : 'bg-slate-200 cursor-pointer'}`}
                onClick={() => setAccessGategory(category.name)}
            >
                {category.name}
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
                <div className="grid grid-cols-5 gap-y-8 justify-between p-8 w-3/4 mx-auto">
                    {actionsElements}
                </div>
            </div>
        </main>
    )
}

export default Page
