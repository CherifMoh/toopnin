"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";


const fetchTags = async()=>{
    const res = await axios.get('/api/products/tags');
    return res.data;
}

function AddTag() {

    const createTag = async(tagData)=>{
        try{
            const res = await axios.post('/api/products/tags',tagData);
            setErrorMessage('')
            router.refresh()
            queryClient.invalidateQueries('tags');
            return res.data;
        }catch(err){
            setErrorMessage(err.message)
            console.log(err)
        }
    }
    
    const { data: Tags, isLoading, isError , error} = useQuery({
        queryKey:['tags'],
        queryFn: fetchTags
    });

    
    const [name,setName] = useState('')
    const [errorMessage,setErrorMessage] = useState('')
    const [deleting,setDeleting] = useState('')
    
    const router = useRouter()
    const queryClient = useQueryClient()

    const [isCreateAccess, setIsCreateAccess] = useState(false)
    const [isDeleteAccess, setIsDeleteAccess] = useState(false)

    const accessibilities = useSelector((state) => state.accessibilities.accessibilities)


    useEffect(()=>{
        if(accessibilities.length === 0)return
        const access = accessibilities.find(item=>item.name === 'products')
        if(!access || access.accessibilities.length === 0){
            router.push('/admin')
        }
        setIsDeleteAccess(access.accessibilities.includes('delete'))
        setIsCreateAccess(access.accessibilities.includes('create'))
    },[accessibilities])

    
    if(isLoading) return <div>Loding...</div>
    if(isError) return <div>{error.message}</div>
    
    const handleDelete = async (id)=>{
        try{
            setDeleting({
                id:id,
                state:true
            })
            const res = await axios.delete(`/api/products/tags/${id}`);       
            router.refresh()
            queryClient.invalidateQueries('tags');
        }catch(err){
            console.log(err)
        }
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        createTag({ name: name});
    };

    const AllTagsElement = Tags.map(tag=>(
        <tr key={tag.name}>
            <td className='capitalize'>
                {tag.name}
            </td>
            {isDeleteAccess &&
            <td >
                <button 
                 className='bg-red-400 p-2 rounded-md'
                 onClick={()=>handleDelete(tag._id)}
                >
                {deleting.state && deleting.id === tag._id ?'Deleting':'Delete'}
                </button>
            </td>
            }
        </tr>
    ))

    const tHeades =[
        {name:'Name'},
        isDeleteAccess &&{name:'Delete'},
    ]

    const tHeadesElements=tHeades.map(tHead=>{
        if(!tHead) return
        return <th key={tHead.name}>{tHead.name}</th>
    })

    return(
        <div className="h-screen w-full flex flex-col justify-start pt-20 gap-40 items-center">

            <div className='w-full'>
                <table border={1} className="border-2 border-gray-400 w-1/4 m-auto ">
                    <thead>
                        <tr>
                            {tHeadesElements}
                        </tr>
                    </thead>
                    <tbody>
                        {AllTagsElement}
                    </tbody>
                </table>
            </div>
                
           {isCreateAccess && 
            <form onSubmit={(e)=>handleSubmit(e)} className='flex w-96 flex-col justify-center items-cente' >
                <label 
                 htmlFor="tag"
                 className="text-center text-xl font-medium"
                >
                    Add a Tag
                </label>

                <input 
                 className='border-gray-400 border-2 rounded-md mb-8 mt-6 capitalize ' 
                 required
                 id="tag" 
                 type="text" 
                 placeholder="Name"
                 onChange={(e)=>setName(e.target.value)}
                />

                <button 
                type='submit' 
                className="p-4 px-8 bg-gray-900 text-white rounded-md"
                >
                    Submit
                </button>
            </form>
            }
            {errorMessage && <p>{errorMessage}</p>}
        </div>
    )
}

export default AddTag;
