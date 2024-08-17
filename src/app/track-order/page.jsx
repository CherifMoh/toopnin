
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

function trackOrder() {
    return (
        <section>
            <div className="bg-[#bda78057] py-9 px-8">
                <h1
                    className='text-lg text-[#9f865d] tracking-wider text-center font-bold'
                >
                    Order Tracking
                </h1>
                <div className=" text-center text-4xl">
                    Track Your Drawlys Order Here
                </div>

            </div>

            <div className="py-9 px-8" >
                <h2 className='text-2xl font-bold mb-9 text-center'>
                    Track Your Order
                </h2>
                <div className="text-center w-1/4 bg-[#bda78057] rounded-md border border-[#9f865d] m-auto items-center flex p-5 flex-col">
                    <label
                        htmlFor="phone"
                        className='self-start mb-1 pl-3 font-bold tracking-wider'
                    >
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phone"
                        className='w-full rounded-lg border bg-[#e7d1b0] border-[#9f865d] p-3'
                    />
                    <button
                        className='flex justify-between items-center font-bold 
                        uppercase tracking-widest py-4 pl-10 pr-2 bg-[#9f865d] mt-4 
                        rounded-xl self-end text-[#DCCCB3] gap-4 cursor-pointer'
                    >
                        Trak
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
        </section>
    )
}

export default trackOrder