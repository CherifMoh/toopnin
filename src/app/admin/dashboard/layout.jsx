
export default function Layout({ ordersTimeChart, children, profit, sales, customers, activeP, ordersChart, ordersPieChart}) {
  return (
    <main className='bg-white p-4'>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sales}
          {customers}
          {activeP}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {profit}
        {ordersTimeChart}
        {ordersChart}
        {ordersPieChart}
      </section>

      <section className="pt-4">

      </section>

      {children}
    </main>

  )
}