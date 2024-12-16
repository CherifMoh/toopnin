
import dynamic from 'next/dynamic';
import { DashboardCard } from '../../../lib/utils';

const PieChartC = dynamic(() => import('../../../../components/admin/charts/PieChartConf'), {
  loading: () => <div>Loading Chart...</div>,
  ssr: false // Disable SSR
});

function Admin() {

  return (
    <div className='pt-4'>
      <DashboardCard
        title="Confirmation"
        body={<PieChartC />}
      />
    </div>
  )
}

export default Admin;