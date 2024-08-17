'use client';

import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from 'next/navigation';
import { dleleteCookies } from "../../../app/actions/users";

function Logout() {
    const router = useRouter();

    const logout = ()=>{
        dleleteCookies()
        router.push('/login')
    }

    

    return (
        <div className='flex-grow flex justify-center pb-8 items-end'>
            <FontAwesomeIcon 
                icon={faArrowRightFromBracket}
                className='size-6 text-red-500 cursor-pointer'
                onClick={logout}
            />
        </div>
    );
}

export default Logout;
