import '../../styles/shared/blackBG.css'

function page() {
  return (
    <div className='w-screen h-screen flex items-center justify-center'>
        <div className='text-white h-14 flex items-center gap-5 justify-between'>
            <div className='border-r pr-5 h-full flex items-center  border-stone-700 text-2xl'>403</div>
            <div className='text-sm h-full flex items-center text-center'>Access Denied: IP Blocked</div>
        </div>
    </div>
  )
}

export default page