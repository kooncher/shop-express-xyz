export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
    // 1. เพิ่มการประกาศ startDate (ย้อนหลัง 7 วัน)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    try {
      // 2. ดึงข้อมูลแบบ Parallel
      const [rpcRes, ordersWithItemsRes] = await Promise.all([
        $supabase.rpc('get_dashboard_summary', { 
          start_date_input: startDate.toISOString() 
        }),
        $supabase
          .from('orders')
          .select('*, order_items(product_name, price, quantity)')
          .order('created_at', { ascending: false })
          .limit(20)
      ])

      if (rpcRes.error) throw rpcRes.error
      if (ordersWithItemsRes.error) throw ordersWithItemsRes.error

      const allOrders = ordersWithItemsRes.data || []
      const productMap: Record<string, { count: number, total: number }> = {}

      // 3. คำนวณหา Top Products จากรายการสินค้าใน Orders
      allOrders.forEach(order => {
        order.order_items?.forEach((item: any) => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { count: 0, total: 0 }
          }
          productMap[item.product_name].count += item.quantity
          productMap[item.product_name].total += Number(item.price || 0) * item.quantity
        })
      })

      // 4. เรียงลำดับ 5 อันดับแรก
      const sorted = Object.entries(productMap)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)

      return {
        data: {
          stats: rpcRes.data?.stats || {},
          chartData: rpcRes.data?.chartData || [],
          recentOrders: allOrders,
          topProducts: {
            names: sorted.map(p => p[0]),
            sales: sorted.map(p => p[1].total),
            counts: sorted.map(p => p[1].count)
          }
        }
      }
    } catch (err) {
      console.error("❌ Dashboard Logic Error:", err)
      throw err
    }
  }
  
  return { getAllDashboardData }
}