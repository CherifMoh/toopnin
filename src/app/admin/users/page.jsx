'use client'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons'
import { faTrashCan } from '@fortawesome/free-regular-svg-icons'
import { deleteUser } from '../../actions/users'
import Spinner from '../../../components/loadings/Spinner';
import RolesComp from '../../../components/admin/roles/Roles';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import dynamic from 'next/dynamic';




async function fetchUsers() {
  const res = await axios.get('/api/users');
  return res.data;
}

function User() {


  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const [deleting, setDeleting] = useState([])

  const [nav, setNav] = useState('users')

  const [isCreateAccess, setIsCreateAccess] = useState(false)
  const [isDeleteAccess, setIsDeleteAccess] = useState(false)
  const [isUpdateRoleAccess, setIsUpdateRoleAccess] = useState(false)
  const [isCreateRoleAccess, setIsCreateRoleAccess] = useState(false)
  const [isDeleteRoleAccess, setIsDeleteRoleAccess] = useState(false)
  const [isDuplicateRoleAccess, setIsDuplicateRoleAccess] = useState(false)

  const accessibilities = useSelector((state) => state.accessibilities.accessibilities)

  const router = useRouter()

  useEffect(()=>{
    if(accessibilities.length === 0)return
      const access = accessibilities.find(item=>item.name === 'users')
      if(!access || access.accessibilities.length === 0){
          router.push('/admin')
      }
      setIsDeleteAccess(access.accessibilities.includes('delete'))
      setIsCreateAccess(access.accessibilities.includes('create'))
      setIsUpdateRoleAccess(access.accessibilities.includes('update role'))
      setIsCreateRoleAccess(access.accessibilities.includes('create role' ))
      setIsDeleteRoleAccess(access.accessibilities.includes('delete role'))
      setIsDuplicateRoleAccess(access.accessibilities.includes('duplicate role'))
  },[accessibilities])

  if (isLoading ) return <div>Loading ...</div>
  if (isError) return <div>{error.message}</div>
  

  const headsArray = [
    'User Name',
    'Profile picture',
    'E-mail',
    'Role',
    isDeleteAccess && 'Actions',
  ]
  function handelDelete(id) {
    setDeleting(pre => ([...pre, {
      id: id,
      state: true
    }]))
    deleteUser(id)
  }

  const headsElement = headsArray.map(title => {
    return (
      <td
        key={title}
        className='border-0 border-r border-r-[#e8edeb] text-sm p-1'
      >
        {title}
      </td>
    )
  })

  const usersElements = users?.map(user => {
    return (
      <tr
        className={`border-b border-y-[#e8edeb] border-0
          ${deleting.some(item => item.id === user._id && item.state) && 'opacity-40'}
        `}
        key={user._id}
      >
        <td className='border-0'>{user.name}</td>
        <td className='border-0'>
          <img 
            src={user.pfp} alt='pfp'
            width={40} height={40}
            className='w-10 h-10 rounded-full'
          />
        </td>
        <td className='border-0'>{user.email}</td>
        <td className='border-0'>{user.role}</td>
        {isDeleteAccess &&
        <td className='border-0 relative'>
          {deleting.some(item => item.id === user._id && item.state)
            ? <Spinner
              color={'border-red-500'}
              size={'h-4 w-4'}
              containerStyle={'absolute top-1/3'}
            />
            : <div className=' flex  gap-6 items-center'>

              {/* <FontAwesomeIcon icon={faPen} className='text-black h-4 hover:bg-gray-300 p-1 rounded-full cursor-pointer' /> */}

              <FontAwesomeIcon
                icon={faTrashCan}
                className='text-black h-4 cursor-pointer hover:bg-gray-300 p-1 rounded-full'
                onClick={() => handelDelete(user._id)}
              />
            </div>
          }
        </td>}
      </tr>
    )
  })


  return (
    <section className='p-4'>

      <header
        className='mt-20 border-b-4 flex px-4 border-b-[#e8edeb] relative'
      >
        <div
          className={`py-2 px-6 font-semibold text-base cursor-pointer ${nav === 'custom' && 'opacity-30'}`}
          onClick={() => setNav('users')}
        >
          Admin Users
        </div>
        <div
          className={`py-2 px-6 font-semibold text-base cursor-pointer ${nav === 'users' && 'opacity-30'}`}
          onClick={() => setNav('custom')}
        >
          Manage Roles
        </div>
        <div
          className={`bg-gray-400 inline-block transition-all duration-1000 w-36 h-1 absolute -bottom-1 
              ${nav === 'custom' && 'left-40'}`}
        ></div>
      </header>



      {nav === 'users' ?
        <>
         { isCreateAccess &&
          <div className='flex justify-end p-4'>
            <Link
              className='bg-gray-400 rounded-lg text-white text-sm px-2 py-1'
              href={'/admin/users/creatUser'}
            >
              <FontAwesomeIcon icon={faPlus} className='mr-2'/>
              Add New Admin User
            </Link>
          </div>
          }
          <table className='w-full mt-4'>
            <thead>
              <tr className='border-y-2 border-y-[#e8edeb] border-x-0'>
                {headsElement}
              </tr>
            </thead>
            <tbody>
              {usersElements}
            </tbody>
          </table>
        </>
        :
        <RolesComp 
          users={users}
          isDuplicateRoleAccess={isDuplicateRoleAccess}
          isCreateRoleAccess={isCreateRoleAccess}
          isDeleteRoleAccess={isDeleteRoleAccess}
          isUpdateRoleAccess={isUpdateRoleAccess}
        />}
    </section>
  )

}

export default User