'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faTrashCan,faPen,faCopy } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { createRole, deleteRole } from '../../../app/actions/users'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

async function fetchRoles() {
    const res = await axios.get('/api/users/roles')
    if(res.data){
        return res.data
    }return []
  }

function Roles({users}) {

    const { data: Roles, isLoading: IsRolesLoading, isError: IsRolesError, error: RolesError } = useQuery({
        queryKey: ['roles'],
        queryFn: fetchRoles
    });

  
    const [actionError,setActionError] = useState()
    
    const [selectRoles,setSelectRoles] = useState([])

    const [roleCounts,setRoleCounts] = useState([])

    const queryClient = useQueryClient()

    const router = useRouter()
    
    useEffect(()=>{
        if (!Roles || !users) return;
        
        const roleCounts = Roles.map(role => ({
            name: role.name,
            count: users.filter(user => user.role === role.name).length,
        }));
      
        setRoleCounts(roleCounts)

    },[Roles,users])

    if (IsRolesLoading) return <div>Loading ...</div>
    if (IsRolesError) return <div>{RolesError.message}</div>
    

    async function duplicteRole(oldRole){
        try{
            let newRole = {...oldRole,name:oldRole.name+'-copy'}
            delete newRole._id;
            const res = await createRole(newRole)
            console.log('test')
            queryClient.invalidateQueries(['roles'])
            router.refresh()
        }catch(error){
            setActionError(error.message)              
        }
    }

    async function handleDeleteRole(id){
        try{
            const res = await deleteRole(id)
            queryClient.invalidateQueries(['roles'])
            router.refresh()
        }catch(error){
            setActionError(error.message)
        }
    }

    async function handleDeleteRoles(){
        try{
            selectRoles.forEach(id=>handleDeleteRole(id))
        }catch(error){
            setActionError(error.message)
        }
    }
    

    function toggleSelectRoles(id){
        setSelectRoles(pre=>{
            if(pre.includes(id)) return pre.filter(item=>item!==id)
            return [...pre,id]
        })
    }

    const rolesElements = Roles.map(role => {
        return (
            <tr 
                className=' border-0 border-b py-4 border-gray-100'
                key={role._id}
            >
                <td className='flex gap-4  border-0 '>
                    <input 
                        type="checkbox" 
                        name={role.name}
                        onChange={()=>toggleSelectRoles(role._id)}
                    />
                    {role.name}
                </td>
                <td className='border-0 '>
                    {role.description}
                </td>
                <td className='border-0 '>
                    {roleCounts.find(item => item.name === role.name)?.count}
                    <span className='ml-2'>users</span>
                </td>
                <td className='flex gap-4 border-0 items-center justify-center '>
                    <FontAwesomeIcon 
                        icon={faCopy} 
                        className='mr-2 cursor-pointer'
                        onClick={()=>duplicteRole(role)}
                        />
                    <FontAwesomeIcon 
                        icon={faPen} 
                        className='mr-2 cursor-pointer'
                        onClick={()=>router.push(`/admin/users/roles/${role._id}`)}
                        />
                    <FontAwesomeIcon 
                        icon={faTrashCan} 
                        className='mr-2 cursor-pointer'
                        onClick={()=>handleDeleteRole(role._id)}
                    />
                </td>
            </tr>
        )
    })

    return (
    <section>
        <div className='flex justify-between items-center p-4'>
            <div>
                <h1 className='text-3xl font-semibold'>
                    Roles
                </h1>

                <h4 className='text-sm'>
                    List of roles                   
                </h4>
            </div>
            <div className=''>
                {actionError} 
            </div>
            <div>
                <a
                className='bg-blue-500 text-white text-sm px-5 py-3'
                href={'/admin/users/roles/addRole'}
                >
                <FontAwesomeIcon icon={faPlus} className='mr-2'/>
                    Add a new role
                </a>
            </div>
        </div>

        <div className='m-4 p-8 bg-slate-50 shadow-md'>
            <div className='flex justify-between items-center'>
                <div className='text-lg font-semibold'>
                    {Roles.length} roles                    
                </div>
                <button
                    className={`${selectRoles.length===0?'bg-gray-200 text-gray-300 ':'bg-red-400 text-white'} font-semibold text-sm px-5 py-3`}
                    disabled={selectRoles.length===0}
                    onClick={handleDeleteRoles}
                >
                    Delete
                </button>
            </div>
            <table className='border-0 w-full'>
                <tbody>
                    {rolesElements}
                </tbody>
            </table>
        </div>
    </section>
    )
}

export default Roles