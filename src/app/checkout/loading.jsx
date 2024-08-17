

import '../../styles/pages/checkout.css'
import Image from 'next/image';
import logo from '../../../public/assets/noBgLogo.png' 






function CheckoutLoading() {
   

    const myArray =[1,2]

    const productsElemtnt =myArray.map(cartItem=>{
        return(
            <div key={cartItem} className="flex text-left items-center mb-3 ">
                <div className="product-image-container min-w-16">
                <div className="relative h-16 w-auto mb-4 flex justify-center items-center bg-gray-300 animate-pulse">
                    <svg
                        className="w-10 h-10 text-gray-200 dark:text-gray-600"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 20 18"
                        >
                        <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                    </svg>
                </div>
                </div>
                <div className="w-32 mx-4 text-sm">
                    <div className="h-4 bg-gray-300 rounded-full mb-4 animate-pulse"></div>
                </div>
                <div className="text-sm flex">
                 <div className="h-4 w-12 mr-2 bg-gray-300 rounded-full mb-4 animate-pulse"></div>
                 Da
                </div>
            </div>
        )
    })

  return (
  <div className='bg-white h-screen overflow-x-hidden lg:overflow-hidden'>
    <header className='flex items-center justify-center'>
        <a href="/" className="logo-container w-24 block">
            <Image alt='' src={logo} width={80} height={80} className="logo" />
        </a>
    </header>
    <main className=' pointer-events-none'>
        <section className="form-section bg-white h-screen">
            <div className="form-container">
                <h1 className='font-bold text-2xl mt-5 mb-5'>Delivery</h1>

                <form >
                    <input 
                      
                     required 
                     className="name"  
                     placeholder="Name" 
                     name="name" 
                     type="text" 
                    />

                    <input                       
                     required 
                     className="phone"  
                     placeholder="Phone" 
                     name="phoneNumber" 
                     type="text" 
                    />


                    <select  
                     required className="wilaya"  
                     name="wilaya"  
                    >
                        <option value="الولاية" hidden >الولاية</option>
                        
                    </select>

                    <input 
                     required 
                     className="baldia"  
                     placeholder="Adresse" 
                     name="adresse" 
                     type="text" 
                    />
                    <select 
                     required className="shippingmethod" 
                     name="shippingMethod"  
                    >
                        <option value='طريقة التوصيل' hidden >طريقة التوصيل</option>
                    </select>
                       
                    
                    <button 
                     type="submit" 
                     className={`submit-button flex justify-center items-start`}
                    >                        
                        أطلب الان                        
                    </button>
                </form>
            </div>
        </section>
        <section className="order-details-section h-screen">
            <div className="order-details-container">
                <div className="order-summary-title">Order Summary</div>

                <div className="product-items-container">
                    {productsElemtnt}
                </div>
    
                <div className="order-price-cintainer">
    
                    <div className="nospasing subtotal prcie-c">
                        <div className="nospasing subtotal-text">Subtotal</div>
                        <div className="nospasing subtotal-price flex items-center justify-center">
                            <div className="h-4 w-14 bg-gray-300 rounded-full mr-2"></div> DA
                        </div>
                    </div>
    
                    <div className="nospasing shipping prcie-c">
                        <div className="nospasing shipping-text">Shipping</div>
                        <div className="nospasing shipping-price">
                            <span className="nospasing js-shipping-price rgb(220 38 38) 600">                               
                                ادخل الولاية و طريقة التوصيل لتحديد السعر                                
                            </span>
                            
                        </div>
                    </div>
    
                    <div className="nospasing total prcie-c">
                        <div className="nospasing total-text">Total</div>
                        <div className="nospasing total-price rgb(220 38 38) 600">                   
                            ادخل الولاية و طريقة التوصيل لتحديد السعر                   
                        </div>
                    </div>
    
                </div>
            </div>

        </section>
    </main>
  </div>
  )
}

export default CheckoutLoading