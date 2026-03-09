export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
   // ใน getAllDashboardData
const [rpcRes, ordersWithItemsRes] = await Promise.all([
  $supabase.rpc('get_dashboard_summary', { start_date_input: startDate.toISOString() }),
  // ดึง orders พร้อมรายการสินค้าข้างใน (Join Table)
  $supabase
    .from('orders')
    .select('*, order_items(product_name, price, quantity)')
    .order('created_at', { ascending: false })
    .limit(20) // ดึงมาสัก 20 ออเดอร์ล่าสุดเพื่อหา Top 5
])

if (rpcRes.error || ordersWithItemsRes.error) throw new Error('Data fetch failed')

const allOrders = ordersWithItemsRes.data || []
const productMap: Record<string, { count: number, total: number }> = {}

// วนลูปจาก orders ที่ดึงมาได้เลย
allOrders.forEach(order => {
  order.order_items?.forEach((item: any) => {
    if (!productMap[item.product_name]) {
      productMap[item.product_name] = { count: 0, total: 0 }
    }
    productMap[item.product_name].count += item.quantity
    productMap[item.product_name].total += Number(item.price || 0) * item.quantity
  })
})

// เรียงลำดับตามยอดขาย (total) หรือจำนวนชิ้น (count)
const sorted = Object.entries(productMap)
  .sort((a, b) => b[1].total - a[1].total)
  .slice(0, 5)

return {
  data: {
    recentOrders: allOrders,
    // ... ส่วนอื่นๆ เหมือนเดิม ...
    topProducts: {
      names: sorted.map(p => p[0]),
      sales: sorted.map(p => p[1].total),
      counts: sorted.map(p => p[1].count) // เพิ่มจำนวนชิ้นไปด้วยถ้าต้องการ
    }
  }
}
  }
  return { getAllDashboardData }
}