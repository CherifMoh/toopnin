'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { faTag, faBoxesStacked, faWarehouse, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';
import defultPfp from '../../../../public/assets/pfp defult.png'
import { editeUserPfp } from '../../../app/actions/users'
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setAccessibilities } from '../../../app/redux/features/accessibilities/accessibilitiesSlice';
import useFcmToken from '../../../hooks/useFcmToken';

const fetchUserEmail = async (email) => {
  const res = await axios.get(`/api/users/email/${email}`);
    if(res.data){
    return res.data
    }
    return {}
}

const fetchRole = async (name) => {
  const res = await axios.get(`/api/users/roles/name/${name}`);
    if(res.data){
    return res.data
    }
    return {}
}

function UserProfile({userEmail}) {

    const { token, notificationPermissionStatus } = useFcmToken();

    const [selectedImage, setSelectedImage] = useState('');
  
    const [User, setUser] = useState('');
    
    const [filebig, setFilebig] = useState(false);
  
    const { data: User1, isLoading, isError, error } = useQuery({
      queryKey: ['user by email', userEmail],
      queryFn: ({ queryKey }) => fetchUserEmail(queryKey[1]),
      enabled: !!userEmail,
    });

    const { data: Role, isLoading: isLoadingRole, isError : isErrorRole, error: errorRole } = useQuery({
      queryKey: ['role by name', User1?.role],
      queryFn: ({ queryKey }) => fetchRole(queryKey[1]),
      enabled: !!User1,
    }); 
  
    
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathName = usePathname()
    
    const accessibilities = useSelector((state) => state.accessibilities.accessibilities)
    
    const dispatch = useDispatch();
    
    
    useEffect(() => {
      if(User1){
        setUser(User1)
      } 
    }, [User1]);

    useEffect(() => {
      if(!User1 || !token) return
      if(User1.fcmTokens.includes(token)) return

      const newFcmTokens = [...User1.fcmTokens, token]
      const newUser = {...User1, fcmTokens: newFcmTokens}
      // console.log(User1._id)
      updteUser(User1._id,newUser)
      
    
    }, [User1,token]);

    useEffect(() => {

      if(Role){
        dispatch(setAccessibilities(Role.accessibilities))
      } 
    }, [Role]);
    
    
    
    typeof document !== 'undefined' && document.body.classList.add('bg-white')
    if(isLoading || isLoadingRole) return <div>Loading...</div>
    if(isError) return <div>{error.message}</div>
    if(isErrorRole) return <div>{errorRole.message}</div>

 

    async function updteUser(id,newUser) {
      try{
        const res = await axios.put(`/api/users/${id}`, newUser)
        console.log(res.data)
        queryClient.invalidateQueries(['user by email', userEmail])
      }catch(err){
        console.log(err)
      }
      
    }

    const AdminLinks = [
        { 
          name: 'orders', 
          icon:faBoxesStacked,
          href: '/admin/orders' 
        },
        { 
          name: 'products', 
          icon:faTag, 
          href: '/admin/products' 
        },
        { 
          name: 'users', 
          icon:faUsers,
          href: '/admin/users' 
        },
        { 
          name: 'storage', 
          icon:faWarehouse,
          href: '/admin/storage' 
        },
        // { name: 'Category', href: '/admin/categoreis' },
    ]
    

    const AdminLinksElemnts = AdminLinks.map(link => {
      const accesseObject = Role.accessibilities.find(item=>item.name === link.name)
      if(!accesseObject ||accesseObject.accessibilities.length === 0) return null
      const isActive = pathName.startsWith(link.href)
      return (
        <Link
          href={link.href}
          className={`h-10 flex items-center relative gap-4 hover:bg-gray-300 p-4 ${isActive && 'bg-gray-300'}`}
          key={link.name}
        >
          <span>
            <FontAwesomeIcon icon={link.icon}/>
          </span>
          <span className='capitalize' >{link.name}</span>
          {isActive && 
            <span className='w-2 h-full bg-black absolute left-0 top-0'></span>
          }
        </Link>)
    })

    function checkFileSize(file, input) {
        if (file) {
            const fileSize = file.size; // in bytes
            const maxSize = 12 * 1024 * 1024; // 12MB in bytes
            if (fileSize > maxSize) {
                alert('File size exceeds the limit. Please select a smaller file.');
                input.value = ''
                return false;
            }
            return true;
        }
    }
    
    async function convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (err) => {
                reject(err);
            };
        });
    }
    
    
    async function changePfp(event) {
      const fileInput = event.target;
      const file = fileInput.files[0];

      if (!file) {
          e.target.files[0] = []
      }
      try{
        const formData = new FormData();
        formData.append('image', file);

        fetch('https://drawlys.com:8444/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {

          setSelectedImage(data)
          editeUserPfp(userEmail, data)
          queryClient.invalidateQueries(['user by email', userEmail])
          router.refresh()
        })
        .catch(error => {
            console.error('Error:', error);
            // document.getElementById('message').innerHTML = `<p>Upload failed. Please try again.</p>`;
        });
    
      }catch(error){
        console.log(error)
      }
        
    }
  

  return (
    <>
        <div className='flex flex-col justify-center items-center mb-16'>
            <div className='relative'>
            <input
                type="file"
                className='opacity-0 size-full absolute'
                id="pfp"
                onChange={changePfp}
            />
            <img 
                src={selectedImage ||User?.pfp || defultPfp} alt='pfp'
                width={150} height={150}
            />
            </div>
            <div
            className='text-blue-600 font-semibold'
            >
            {User?.role}
            </div>
            <div className='capitalize'>{User?.name}</div>
        </div>
        {AdminLinksElemnts}
       
    </>
  )
}

export default UserProfile