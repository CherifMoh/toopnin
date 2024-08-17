
function Spinner({ color, size, containerStyle }) {

  return (
    <div className={`${containerStyle}`}>
        <div className="relative">
            <div
             className={`${size} rounded-full absolute border-4 
              border-solid border-gray-200`}
             >
            </div>
            <div 
             className={`${size} rounded-full animate-spin absolute
               border-4 border-solid ${color?color:'border-black'} border-t-transparent`}
             >
            </div>
        </div>
    </div>
  )
}

export default Spinner