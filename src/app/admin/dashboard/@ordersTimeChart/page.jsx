
import dynamic from 'next/dynamic';
import { DashboardCard } from '../../../lib/utils';

const OrdersTimeChart = dynamic(() => import('../../../../components/admin/charts/OrdersTimeChart'), {
  loading: () => <div>Loading Chart...</div>,
  ssr: false // Disable SSR
});

function Admin() {

  return (
    <div className='pt-4'>
        <DashboardCard
          title="Sales"
          body={<OrdersTimeChart />}
          />
    </div>
  )
}

export default Admin;