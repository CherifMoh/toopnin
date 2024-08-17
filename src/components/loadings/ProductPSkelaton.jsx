import Image from 'next/image'
import ruler from '../../../public/assets/ruler.svg'
import arrowDown from '../../../public/assets/arrow-down.svg'
import Material from '../../../public/assets/Material.svg'


const ProductGSkeleton = () => {

    const gridArray = [1, 2, 3, 4]
    const descArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    const GridElemnts = gridArray.map(num => (
        <div key={num} className="relative md:w-28 md:h-28 mb-4 flex justify-center items-center main-image main-image-on bg-gray-300 animate-pulse">
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
    ))

    const descElemnt = descArray.map(num => {
        return (
            <div
                key={num}
                className={`spawn-anime  my-4 h-4 rounded-lg bg-gray-300 animate-pulse ${num === 5 ? 'w-72 mb-12' : 'w-[450px]'} `}
            >
            </div>
        )
    })

    return (
        <section className="main-section">
            <section className="selected-prodect-container">
                <section className="product-gallery">
                    <div className="main-image-container">
                        <div className="relative md:h-[550px] md:w-64 h-56 w-20 mb-4 flex justify-center items-center main-image main-image-on bg-gray-300 animate-pulse">
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
                    <div className="gallery-container flex gap-1">
                        {GridElemnts}
                    </div>
                </section>
                <section className="product-info">
                    <div className="product-title spawn-anime w-full h-6 rounded-lg bg-gray-300 animate-pulse ">
                    </div>
                    <div className="price-container flex spawn-anime">
                        <div
                            className="price-after-sale spawn-anime w-24 h-6 rounded-lg bg-gray-300 animate-pulse "
                        >
                        </div>
                        {/* <span className="sale-mark">Sale</span> */}
                    </div>
                    <p className="spawn-anime mt-4 mb-4">Quantity</p>
                    <div className="quantity-container spawn-anime flex">
                        <button
                            className="minus-quantity-button flex items-start justify-center"
                        >
                            _
                        </button>
                        <div
                            className="quantity-input text-center flex items-center justify-center"
                        >1</div>
                        <button
                            className="plus-quantity-button pb-1"
                        >
                            +
                        </button>
                    </div>
                    <button
                        className="Add-to-cart bg-[#bda780] spawn-anime text-[#1a2332]"
                    >
                        Add to cart
                    </button>
                    <button
                        className="Add-to-cart spawn-anime text-[#DCCCB3] bg-[#4a3623]"
                    >Buy now</button>

                    <div className="discription-container spawn-anime">
                        {descElemnt}
                        <div className="drop-container">
                            <div className="drop-down">
                                <div className="drop-header js-dimensions cursor-pointer" >
                                    <Image className="drop-icon" src={ruler} width={5} height={5} alt="" />
                                    <h2 className="drop-title">Dimensions</h2>
                                    <Image
                                        src={arrowDown} width={5} height={5} alt=""
                                        className={`drop-arrow js-dimensions-arrow transition-all duration-100`}
                                    />
                                </div>


                                <div className="drop-down">
                                    <div className="drop-header js-material drop-header2 cursor-pointer">
                                        <Image
                                            className="drop-icon"
                                            src={Material}
                                            width={10}
                                            height={10}
                                            alt=""
                                        />
                                        <h2 className="drop-title">Material</h2>
                                        <Image
                                            className={`drop-arrow js-material-arrow transition-all duration-100`}
                                            src={arrowDown} alt=""
                                            height={5} width={5}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
};

export default ProductGSkeleton;