'use client'

import { Fragment } from "react"
import { useEffect, useRef, useState } from "react"




function BottomBar() {

    const container = useRef('')
    const text = useRef('')

    const [cWidth, setCWidth] = useState(0)
    const [tWidth, setTWidth] = useState(0)

    const [num, setNum] = useState(0)

    const [isHeld, setIsHeld] = useState(false)



    useEffect(() => {
        if (container.current) {
            setCWidth(container.current.clientWidth);
        }
        if (text.current) {
            setTWidth(text.current.clientWidth);
        }
    }, [container, text]);

    useEffect(() => {

        const intervalId = setInterval(() => {
            setNum(pre => {
                if (pre >= tWidth && tWidth) {
                    return 0
                }
                return pre + 0.5
            }
            )
        }, 1)

        return () => clearInterval(intervalId)

    }, [tWidth]);

    const tNum = Math.floor(cWidth / tWidth)

    let textElemente = []
    for (let i = 0; i < tNum; i++) {
        textElemente.push(
            <h5
                className='pl-16 font-semibold whitespace-nowrap text-lg w-max'
                key={i}
            >
                توصيل متوفر<span className='font-normal'> 58 </span>ولاية
            </h5>
        )
    }

    const cStyle = {
        width: `${tWidth ? `calc(100vw + ${tWidth}px)` : '100vw'}`,
        transform: `translateX(${num > 0 && !isHeld ? -num : '0'}px)`

    }

    return (
        <div className='w-screen overflow-hidden'>
            <div
                className='fixed bottom-0 whitespace-nowrap text-black flex bg-[#f5f5f5]'
                ref={container}
                style={cStyle}
                onMouseOver={() => setIsHeld(true)}
                onMouseLeave={() => setIsHeld(false)}
            >
                <h5
                    className='font-semibold pl-16 text-lg w-max'
                    ref={text}
                >
                    توصيل متوفر<span className='font-normal'> 58 </span>ولاية
                </h5>
                {textElemente}
            </div>
        </div>
    )
}

export default BottomBar