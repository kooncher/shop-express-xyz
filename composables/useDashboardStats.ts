export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
    const today = new Date().toLocaleDateString('en-CA')
    
    try {
      // 1. ดึงข้อมูล (เพิ่มการดึงรายละเอียดสินค้าสำหรับ Low Stock)
      const [ordersRes, productsRes, profilesRes] = await Promise.all([
        $supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        $supabase.from('products').select('id, name, stock, sku'), // ดึง id, name, sku เพิ่ม
        $supabase.from('profiles').select('id', { count: 'exact' })
      ])

      if (ordersRes.error) throw ordersRes.error
      const allOrders = ordersRes.data || []
      const allProducts = productsRes.data || []
      
      // 2. คำนวณสินค้าสต็อกต่ำ (Low Stock) ✨ เพิ่มใหม่
      // กรองสินค้าที่สต็อก <= 10 และเรียงลำดับจากน้อยไปมาก
      const lowStockProducts = allProducts
        .filter(p => (p.stock || 0) <= 10)
        .sort((a, b) => (a.stock || 0) - (b.stock || 0))
        .slice(0, 10) // เอามาแสดงแค่ 10 รายการพอในหน้าแรก

      // 3. เตรียมโครงสร้างสำหรับยอดขาย 7 วันล่าสุด (Chart Data)
      const last7Days: Record<string, number> = {}
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toLocaleDateString('en-CA')
        last7Days[dateStr] = 0
      }

      const stats = {
        today_sales: 0,
        new_orders_count: 0,
        new_customers_count: profilesRes.data?.length || 0,
        total_stock: allProducts.reduce((sum, p) => sum + (p.stock || 0), 0) || 0
      }

      const productMap: Record<string, { count: number, total: number }> = {}

      // 4. วนลูปข้อมูล Order
      allOrders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-CA')

        // ก. Stats วันนี้ (เช็คทั้งภาษาไทยและอังกฤษเพื่อความชัวร์)
        if (orderDate === today) {
          if (order.status === 'สำเร็จแล้ว' || order.status === 'completed') {
            stats.today_sales += Number(order.total || 0)
          }
          stats.new_orders_count++
        }

        // ข. ข้อมูลลงกราฟ 7 วัน
        if (last7Days[orderDate] !== undefined && (order.status === 'สำเร็จแล้ว' || order.status === 'completed')) {
          last7Days[orderDate] += Number(order.total || 0)
        }

        // ค. Top Products
        order.order_items?.forEach((item: any) => {
          if (!productMap[item.product_name]) {
            productMap[item.product_name] = { count: 0, total: 0 }
          }
          productMap[item.product_name].count += item.quantity
          productMap[item.product_name].total += Number(item.price || 0) * item.quantity
        })
      })

      // 5. จัดรูปแบบข้อมูล
      const chartLabels = Object.keys(last7Days).map(date => {
        const [y, m, d] = date.split('-')
        return `${d}/${m}`
      })
      
      const sorted = Object.entries(productMap)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5)

      return {
        data: {
          stats: stats,
          recentOrders: allOrders.slice(0, 20),
          lowStockProducts: lowStockProducts, // ✨ ส่งข้อมูลนี้กลับไป
          topProducts: {
            names: sorted.map(p => p[0]),
            sales: sorted.map(p => p[1].total),
            counts: sorted.map(p => p[1].count)
          },
          chartData: {
            dates: chartLabels,
            sales: Object.values(last7Days)
          }
        }
      }
    } 
    catch (err) {
      console.error("❌ Dashboard Logic Error:", err)
      throw err
    }
  }

  return { getAllDashboardData }
}