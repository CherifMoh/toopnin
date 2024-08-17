import Link from 'next/link'
import { cookies } from 'next/headers';
import UserProfile from './UserProfile'
import Logout from './Logout'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";


function Dashboard() {


  return (
    <div className='w-32 sm:w-48 md:w-72 flex flex-col justify-start h-screen bg-gray-100 pt-5 mr-5 z-[9999999999] fixed left-0 overflow-y-auto'>
      <Link
        href='/admin/dashboard'
        className='md:text-3xl sm:text-xl text-lg font-extrabold text-center block mb-10'
      >
        Dashboard
      </Link>   
     
      <UserProfile userEmail={cookies().get('user-email')?.value} />
      
      <Logout />

    </div>
  )
}

export default Dashboard