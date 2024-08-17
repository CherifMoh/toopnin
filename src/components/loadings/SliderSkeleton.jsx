import Image from "next/image";

const SliderSkeleton = () => {

    return (
        <div className={`flex justify-center items-center relative gap-8  `}>
            <Image
                width={300} height={300}
                className={`w-1/4 md:w-1/6 h-auto rounded-lg blur-[1px]`}
                src='/assets/loading.png'
                alt="Previous"
            />

            <Image
                width={600} height={600}
                className={`w-1/2 md:w-1/3 h-auto rounded-2xl `}
                src='/assets/loading.png'
                alt="Main"
            />

            <Image
                width={300} height={300}
                className={`w-1/4 md:w-1/6 h-auto rounded-lg`}
                src='/assets/loading.png'
                alt="Next"
            />
        </div>
    );

};

export default SliderSkeleton;
