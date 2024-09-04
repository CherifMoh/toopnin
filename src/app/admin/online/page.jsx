'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import  faFacebookF from "../../../../public/assets/facebook.png";
import Image from 'next/image';
import { faFloppyDisk, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { addPixel, deletePixel } from '../../actions/pixel';
import { useRouter } from 'next/navigation';

async function fetchPixels() {
    const res = await axios.get('/api/pixel');
    return res.data;
}

function page() {

  const  queryClient = useQueryClient()
  const  router = useRouter()

  const { data: Pixels, isLoading, isError, error } = useQuery({
      queryKey: ['all pixel ids'],
      queryFn: fetchPixels,
  });

  const [pixalId, setPixalId] = useState('');

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching Orders: {error.message}</div>;

  async function handleAddPixel(e) {
    e.preventDefault();
    try{
        await addPixel(pixalId)
        setPixalId('')
        router.refresh()
        router.push('/admin/online')
        queryClient.invalidateQueries('all pixel ids')
    }catch (err) {
        console.log(err)
    }
  }

  async function handelDelete(id){
    try{
        await deletePixel(id)
        router.refresh()
        router.push('/admin/online')
        queryClient.invalidateQueries('all pixel ids')
    }catch (err) {
        console.log(err)
    }
  }


  const pixelIdsElement = Pixels?.map(pixel=>{
    return (
        <div
            key={pixel._id}
            className='border flex items-center mt-4 justify-between border-gray-300 flex-grow px-4 py-2 rounded '
        >
            <span>{pixel.pixelID}</span>

            <div 
                className='bg-red-500 rounded-full px-2 py-1 cursor-pointer'
                onClick={() => handelDelete(pixel._id)}
            >
                <FontAwesomeIcon icon={faTrash} className='text-white'/>
            </div>
        </div>
    )
  })

  

  return (
    <div className='w-full pt-8 h-screen'>
        <div className='w-1/3 h-max min-h-96 mx-auto border-4 border-t-0 border-[rgb(56,92,142)] '>
            <header className='bg-[rgb(56,92,142)] flex items-center justify-between p-2'>
                <div className='flex items-center gap-3 text-white font-semibold'>
                    <Image   
                        src={faFacebookF}
                        alt='facebook icon'
                        className='pb-2'
                        width={12}
                        height={12}
                    />
                    <span>
                        Facebook pixal settings
                    </span>
                </div>
                <div className='bg-white p-4 flex gap-3 items-center text-[rgb(56,92,142)]'>
                <FontAwesomeIcon icon={faFloppyDisk}/>
                save
                </div>
            </header>

            <main className='w-full h-full py-4 px-6'>
                <form onSubmit={handleAddPixel}>
                    <span className='text-sm'>Facebook pixal</span> 
                    <div className='flex items-center gap-3'>
                        <input 
                            type="text"
                            value={pixalId}
                            onChange={(e) => setPixalId(e.target.value)}
                            placeholder='pixal id'
                            className='border border-gray-300 flex-grow p-4 rounded'
                        />
                        <button className='bg-[rgb(56,92,142)] flex gap-2 items-center py-4 px-6 text-white rounded'>
                            <FontAwesomeIcon icon={faPlus}/>
                            Add                       
                        </button>
                    </div>
                </form>
                <div>
                    {pixelIdsElement}
                </div>

            </main>
        </div>
    </div>

  )
}

export default page