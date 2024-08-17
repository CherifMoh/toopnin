
import dynamic from 'next/dynamic';
import { DashboardCard } from '../../../lib/utils';

const PieChartC = dynamic(() => import('../../../../components/admin/charts/PieChart'), {
  loading: () => <div>Loading Chart...</div>,
  ssr: false // Disable SSR
});

function Admin() {

  return (
    <div className='pt-4'>
      <DashboardCard
        title="Orders"
        body={<PieChartC />}
      />
    </div>
  )
}

export default Admin;