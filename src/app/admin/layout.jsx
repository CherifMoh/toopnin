import Dashboard from "../../components/admin/dashboard/Dashboard"

export const metadata = {
  title: 'Admin Dashboard',

}


export default function Layout({ children }) {
  return (
    <div className='pl-32 md:pl-72 sm:pl-48 bg-white'>
      <Dashboard />
      {children}
    </div>

  )
}