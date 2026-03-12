export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
    const today = new Date().toLocaleDateString('en-CA') // วันที่วันนี้ YYYY-MM-DD
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)

    try {
      // 1. ดึงข้อมูลจาก 3 ตารางหลักพร้อมกัน (Parallel)
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        $supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        $supabase.from('products').select('stock'),
        $supabase.from('profiles').select('id', { count: 'exact' })
      ])

      if (ordersRes.error) throw ordersRes.error
      
      const allOrders = ordersRes.data || []
      
      // 2. คำนวณ Stats จากข้อมูลที่ดึงมาได้เลย
      const stats = {
        today_sales: 0,
        new_orders_count: 0,
        new_customers_count: profilesRes.data?.length || 0, // จำนวนลูกค้าทั้งหมด
        total_stock: productsRes.data?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0 // รวมสต็อกสินค้าทั้งหมด
      }

      const productMap: Record<string, { count: number, total: number }> = {}

      allOrders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-CA')

        // ก. คำนวณยอดวันนี้ (เช็กจากวันที่สร้าง)
        if (orderDate === today) {
          if (order.status === 'สำเร็จแล้ว') { // เช็กสถานะให้ตรงกับในฐานข้อมูล
            stats.today_sales += Number(order.total || 0)
          }
          stats.new_orders_count++
        }

        // ข. คำนวณ Top Products (Logic เดิมของคุณ)
        order.order_items?.forEach((item: any) => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { count: 0, total: 0 }
          }
          productMap[item.product_name].count += item.quantity
          productMap[item.product_name].total += Number(item.price || 0) * item.quantity
        })
      })

      const sorted = Object.entries(productMap)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)

      return {
        data: {
          stats: stats, // ส่งก้อนที่คำนวณใหม่ไปให้ Dashboard.vue
          recentOrders: allOrders.slice(0, 20),
          topProducts: {
            names: sorted.map(p => p[0]),
            sales: sorted.map(p => p[1].total),
            counts: sorted.map(p => p[1].count)
          },
          chartData: [] // ส่วนนี้สามารถวนลูปสร้างจาก allOrders ได้เหมือนกันครับ
        }
      }
    } catch (err) {
      console.error("❌ Dashboard Logic Error:", err)
      throw err
    }
  }

  return { getAllDashboardData }
}