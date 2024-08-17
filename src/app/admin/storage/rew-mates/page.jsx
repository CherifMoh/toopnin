"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link"
import { useEffect, useState } from "react";
import { addRewMates, deleteRewMate} from "../../../actions/storage"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Spinner from "../../../../components/loadings/Spinner";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";


const fetchRewMates = async () => {
  const res = await axios.get(`/api/storage/rewMates`);
  if(!res.data) return []
  return res.data;
}


function RawMaterials() {

  const queryClient = useQueryClient();

  const { data: RewMates, isLoading: IsLoading, isError: IsError, error: Error } = useQuery({
    queryKey: ['Rew Mates'],
    queryFn: fetchRewMates
  });

  const [isAdding, setIsAdding] = useState(false)

  const [formData, setFormData] = useState({
    name:'',
    qnts:[{
      price:null,
      qnt:null
    }]
  })

  const [deleting, setDeleting] = useState([])

    const [isCreateAccess, setIsCreateAccess] = useState(false)
    const [isUpdateAccess, setIsUpdateAccess] = useState(false)
    const [isDeleteAccess, setIsDeleteAccess] = useState(false)

    const accessibilities = useSelector((state) => state.accessibilities.accessibilities)

    const router = useRouter()
 
    useEffect(()=>{
        if(accessibilities.length === 0)return
        const access = accessibilities.find(item=>item.name === 'storage')
        if(!access || access.accessibilities.length === 0){
          router.push('/admin')
        }
        if(!access.accessibilities.includes('delete') && !access.accessibilities.includes('create')){
          router.push('/admin')
        }
        setIsDeleteAccess(access.accessibilities.includes('delete'))
        setIsUpdateAccess(access.accessibilities.includes('update'))
        setIsCreateAccess(access.accessibilities.includes('create'))
    },[accessibilities])
      
 
  if (IsLoading) return <div>Loading...</div>;

  if (IsError) return <div>Error: {Error.message}</div>;


  function handleNameChange(e) {
    e.preventDefault()

    const name = e.target.name
    const value = e.target.value
    setFormData(preState => ({
      ...preState,
      [name]: value
    }))
  }
  function handleQntPriceChange(e) {
    e.preventDefault()

    const name = e.target.name
    const value = e.target.value
    setFormData(preState => ({
      ...preState,
      qnts:[{
        ...preState?.qnts[0],
        [name]:value
      }]
    }))
  }


  async function handleSubmit(e) {
    e.preventDefault();
    await addRewMates(formData);
    setFormData({
      name:'',
      qnts:[{
        price:0,
        qnt:0
      }]});
    setIsAdding(false);
    queryClient.invalidateQueries(['Rew Mates']);
  }

  async function handleDelete(id) {
    setDeleting(pre => ([...pre, id]))
    const res = await deleteRewMate(id)
    queryClient.invalidateQueries(['Rew Mates']);
    setDeleting(pre => pre.filter(delId => delId !== id))
  }

  const materials = RewMates.map(mate => <td key={mate._id}>{mate.name}</td>);
  const quantities = RewMates.map(mate => {
    let totalQnt = 0
  
    mate?.qnts.forEach(qnt=>totalQnt=totalQnt+Number(qnt.qnt))
    return(
      <td key={mate._id}>{totalQnt}</td>
    )
  });
  const actions = RewMates.map(mate =>(
    <td key={mate._id}>
       {deleting.includes(mate._id)
          ? <Spinner size={'h-8 w-8'} color={'border-red-500'} containerStyle={'ml-1 -mt-4'} />
          : <button
              className=' p-2 rounded-md'
              onClick={() => handleDelete(mate._id)}
          >
              <FontAwesomeIcon icon={faTrashCan} className="text-red-700" />
          </button>
        }
    </td>
  ));

  return (
    <main className='p-4 w-full h-screen flex items-center gap-5 justify-start flex-col'>
      {isCreateAccess &&
        <button
          className='bg-gray-400 rounded-lg text-white text-sm px-2 py-1'
          onClick={() => setIsAdding(prev => !prev)}
        >
          <span className='mr-2 font-bold text-base'>+</span>
          Add New Rew Material
        </button>
      }
      {isAdding &&
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <div>
            <input 
              type="text"
              name="name"
              onChange={handleNameChange}
              value={formData.name}
              required 
              className="border border-black mr-1 p-4 rounded-md"
              placeholder="Material Name"
            />
            <input 
              type='text'
              name="qnt"
              onChange={handleQntPriceChange}
              value={formData?.qnts[0]?.qnt}
              required 
              className="border w-28 border-black p-4 rounded-md"
              min={1}
              placeholder="Quantity"
            />
            <input 
              type='text'
              name="price"
              onChange={handleQntPriceChange}
              value={formData?.qnts[0]?.price}
              required 
              className="border w-28 border-black p-4 rounded-md"
              min={1}
              placeholder="Price"
            />
          </div>
          <button className="bg-gray-900 rounded-lg text-white px-4 py-2">
            Add             
          </button>
        </form>
      }
      <table className='self-start'>
        <tbody>
          <tr>
          <td>المادة الأولية</td>
            {materials}
          </tr>
          <tr>
            <td>الكمية</td>
            {quantities}
          </tr>
          {isDeleteAccess &&
            <tr>
              <td>Actions</td>
              {actions}
            </tr>
          }
        </tbody>
      </table>
    </main>
  );
}

export default RawMaterials;