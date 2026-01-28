export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  const getAllDashboardData = async () => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      startDate.setHours(0, 0, 0, 0)

      const [ordersRes, productsRes] = await Promise.all([
        $supabase.from('orders').select('*').gte('created_at', startDate.toISOString()).order('created_at', { ascending: false }),
        $supabase.from('products').select('stock, name')
      ])

      if (ordersRes.error) throw ordersRes.error
      const allOrders = ordersRes.data || []

      // --- จัดการข้อมูลสถิติ ---
      const todayStr = new Date().toISOString().split('T')[0] // ได้ค่า YYYY-MM-DD
      
      const paidOrders = allOrders.filter(o => 
        o.payment_status === 'paid' || o.payment_status === 'ชำระเงินแล้ว'
      )
      
      // คำนวณยอดขายวันนี้ (เช็คจากวันที่สร้าง)
      const totalSales = paidOrders
        .filter(o => o.created_at.startsWith(todayStr))
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0)

      // --- เตรียมข้อมูลกราฟ (จุดสำคัญที่ทำให้กราฟไม่ขึ้น) ---
      const salesMap = new Map()
      const last7DaysLabels: string[] = []

      // สร้าง Label รอไว้ 7 วัน (ย้อนกลับจากวันนี้)
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        // ใช้ Key เป็น YYYY-MM-DD เพื่อให้เปรียบเทียบกับ DB ได้แม่นยำ
        const key = d.toISOString().split('T')[0] 
        // ใช้ Label เป็นวันที่แบบไทยแสดงบนกราฟ
        const label = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })
        
        salesMap.set(key, { label, value: 0 })
        last7DaysLabels.push(key)
      }

      // นำออเดอร์ที่จ่ายแล้วมาบวกลงใน Map
      paidOrders.forEach(o => {
        const orderDateKey = o.created_at.split('T')[0] // ตัดเอาแค่ YYYY-MM-DD จาก 2024-01-28T...
        if (salesMap.has(orderDateKey)) {
          const current = salesMap.get(orderDateKey)
          salesMap.set(orderDateKey, { ...current, value: current.value + (Number(o.total) || 0) })
        }
      })

      // แปลงข้อมูลกลับเป็น Array เพื่อส่งให้ Chart.js
      const chartLabels = last7DaysLabels.map(key => salesMap.get(key).label)
      const chartValues = last7DaysLabels.map(key => salesMap.get(key).value)

      return {
        data: {
          recentOrders: allOrders.slice(0, 10),
          stats: {
            totalSales,
            newOrdersCount: allOrders.filter(o => o.created_at.startsWith(todayStr)).length,
            newCustomersCount: new Set(allOrders.map(o => o.customer_id)).size,
            totalStock: productsRes.data?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0,
            lowStockCount: productsRes.data?.filter(p => (p.stock || 0) < 10).length || 0
          },
          chartData: {
            dates: chartLabels,
            sales: chartValues
          },
          topProducts: {
            names: ['สินค้า A', 'สินค้า B', 'สินค้า C'], 
            sales: [1200, 900, 600]
          }
        },
        error: null
      }
      
    } catch (error) {
      console.error('Dashboard Error:', error)
      return { data: null, error }
    }
  }

  return { getAllDashboardData }
}