"use client"

import { useState, useRef } from "react";

function Page() {
    const [isHeld, setIsHeld] = useState(false);
    const [mouseX, setMouseX] = useState(0);
    const [offsetX, setOffsetX] = useState(0);
    const [start, setStart] = useState(0);
    const [width, setWidth] = useState(0);
    const containerRef = useRef(null);


    const Tags = [
        'game',
        'japan',
        'random',
        'nature',
        'see',
        'text',
        'text1',
        'text2',
        'text3',
        'text4',
        'text5',
        'text6',
    ];

    const handleMouseDown = (e) => {
        setIsHeld(true);
        const containerRect = containerRef.current.getBoundingClientRect();
        setWidth(containerRect.width) 
        setOffsetX(e.clientX - containerRect.left);
        mouseX === 0 && setStart(e.clientX)
    };
  
    const handleMouseUp = () => {
        setIsHeld(false);
    };
    
    const handleClick = () => {
        setIsHeld(false);
    };
    
    const handleMouseMove = (e) => {
        if (isHeld) {
            console.log('mouse: '+e.clientX) 
            setMouseX(e.clientX - start -offsetX/4.2);
        }
    };

    const element = Tags.map(tag => (
        <button 
            key={tag} 
            className='inline-block  text-white bg-slate-900 py-1 px-4 rounded-full'
            
        >
            {tag}
        </button>
    ));


    console.log('mouse: '+mouseX) 
    console.log('width: '+ -width) 

    return (
        <main className={`w-full flex justify-center`}>
            <div className='w-96 overflow-hidden'>         
                <div 
                    className='flex gap-4 border w-min cursor-pointer border-white py-4' 
                    ref={containerRef}
                    onClick={handleClick}
                    onMouseDown={handleMouseDown} 
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                    style={{ transform: `translateX(${mouseX}px)` }}
                    >
                    {element}
                </div>
            </div>
        </main>
    );
}

export default Page;
