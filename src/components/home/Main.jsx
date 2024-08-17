'use client'


import '../../styles/pages/index.css'
import ImageSlider from '../../components/home/ImageSlider'
import SliderSkeleton from '../../components/loadings/SliderSkeleton'
import Image from 'next/image'

import mainBg from '../../../public/assets/oldlogo.jpg'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'



function HomeMain() {

    async function fetchDesigns() {
        try {
            const res = await axios.get('/api/products/ledDesigns/images');
            return res.data;
        } catch (err) {
            // console.log('*********************** Error *****************************')
            console.log(err.message)
        }
    }

    const { data: Designs, isLoading, isError, error: designErr } = useQuery({
        queryKey: ['Designs images'],
        queryFn: fetchDesigns
    });

    if (isLoading) {
        return (
            <main className='relative w-full h-auto py-5 overflow-hidden mb-2'>
                <Image
                    src={mainBg} alt=''
                    width={2000} height={2000}
                    className='h-auto w-full opacity-40 absolute -top-10 right-0 -z-20'
                />
                <h1
                    className='text-3xl font-bold text-center mb-4'
                >
                    Drawlys
                    مرحبا بيك عندنا في

                </h1>
                <SliderSkeleton />
            </main>
        )
    }
    if (isError) return <div>{designErr.message}</div>

    let images = Designs.map(design => design.imageOn)


    return (
        <main className='relative w-full h-auto py-5 overflow-hidden mb-2'>
            <Image
                src={mainBg} alt=''
                width={2500} height={2500}
                className='h-auto w-full opacity-40 absolute lg:-top-64 md:-top-32 -top-10 right-0 -z-20'
            />
            <h1
                className='text-3xl font-bold text-center mb-4'
            >
                Drawlys
                مرحبا بيك عندنا في

            </h1>
            <ImageSlider images={images} />
        </main>
    )
}

export default HomeMain