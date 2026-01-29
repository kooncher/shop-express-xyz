export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      // ดึงข้อมูลพร้อมกันเพื่อลด Latency
      const [rpcRes, ordersRes, itemsRes] = await Promise.all([
        $supabase.rpc('get_dashboard_summary', { start_date_input: startDate.toISOString() }),
        $supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        $supabase.from('order_items').select('product_name, price, quantity')
      ])

      if (rpcRes.error || ordersRes.error || itemsRes.error) throw new Error('Data fetch failed')

      // คำนวณสินค้าขายดีจาก order_items
      const productMap: Record<string, number> = {}
      itemsRes.data?.forEach(item => {
        const total = Number(item.price || 0) * (item.quantity || 0)
        productMap[item.product_name] = (productMap[item.product_name] || 0) + total
      })

      const sorted = Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

      return {
        data: {
          recentOrders: ordersRes.data || [],
          stats: {
            totalSales: rpcRes.data?.total_sales_today ?? 0,
            newOrdersCount: rpcRes.data?.new_orders_count ?? 0,
            newCustomersCount: rpcRes.data?.new_customers_count ?? 0,
            totalStock: rpcRes.data?.total_stock ?? 0,
            lowStockCount: rpcRes.data?.low_stock_count ?? 0,
          },
          chartData: {
            dates: rpcRes.data?.sales_chart_data?.map((d: any) => d.label) || [],
            sales: rpcRes.data?.sales_chart_data?.map((d: any) => d.value) || []
          },
          topProducts: {
            names: sorted.map(p => p[0]),
            sales: sorted.map(p => p[1])
          }
        },
        error: null
      }
    } catch (error) {
      console.error('Service Error:', error)
      return { data: null, error }
    }
  }
  return { getAllDashboardData }
}