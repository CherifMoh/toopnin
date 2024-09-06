
import dynamic from 'next/dynamic';
import { DashboardCard } from '../../../lib/utils';

const OrdersLineChart = dynamic(() => import('../../../../components/admin/charts/OrdersLineChart'), {
  loading: () => <div>Loading Chart...</div>,
  ssr: false // Disable SSR
});

function Admin() {

  return (
    <div className='pt-4'>
        <DashboardCard
          title="Comparison"
          body={<OrdersLineChart />}
          />
    </div>
  )
}

export default Admin;