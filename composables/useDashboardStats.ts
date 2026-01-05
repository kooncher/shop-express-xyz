export const useDashboard = () => {
  const { $supabase } = useNuxtApp()

  // ดึงข้อมูล Orders ล่าสุด
  const getRecentOrders = async (limit: number = 10) => {
    try {
      const { data, error } = await $supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get recent orders error:', error)
      return { data: null, error }
    }
  }

  // คำนวณสถิติ Dashboard
  const getDashboardStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()

      // ยอดขายวันนี้ - ใช้ total จากตาราง orders
      const { data: todaySales, error: salesError } = await $supabase
        .from('orders')
        .select('total')
        .gte('created_at', todayISO)
        .eq('status', 'completed') // หรือ status ที่ถือว่าชำระแล้ว

      if (salesError) throw salesError

      const totalSales = todaySales?.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) || 0

      // คำสั่งซื้อใหม่วันนี้
      const { count: newOrdersCount, error: ordersError } = await $supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)

      if (ordersError) throw ordersError

      // ลูกค้าใหม่สัปดาห์นี้ (ถ้าไม่มีตาราง customers ให้ใช้ข้อมูลจาก orders)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      // นับจำนวนลูกค้าที่ไม่ซ้ำกันในสัปดาห์นี้
      const { data: weekOrders, error: weekError } = await $supabase
        .from('orders')
        .select('customer_id')
        .gte('created_at', weekAgo.toISOString())

      if (weekError) throw weekError

      const uniqueCustomers = new Set(weekOrders?.map(o => o.customer_id)).size

      // สินค้าคงเหลือ
      const { data: products, error: productsError } = await $supabase
        .from('products')
        .select('stock')

      if (productsError) throw productsError

      const totalStock = products?.reduce((sum, p) => sum + (p.stock || 0), 0) || 0
      const lowStockCount = products?.filter(p => (p.stock || 0) < 10).length || 0

      return {
        data: {
          totalSales,
          newOrdersCount: newOrdersCount || 0,
          newCustomersCount: uniqueCustomers || 0,
          totalStock,
          lowStockCount
        },
        error: null
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return { data: null, error }
    }
  }

  // ดึงข้อมูลกราฟยอดขาย 7 วัน
  const getSalesChartData = async (days: number = 7) => {
    try {
      const dates: string[] = []
      const sales: number[] = []

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const { data, error } = await $supabase
          .from('orders')
          .select('total')
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDay.toISOString())

        if (error) throw error

        const dayTotal = data?.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0) || 0

        dates.push(date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }))
        sales.push(dayTotal)
      }

      return { data: { dates, sales }, error: null }
    } catch (error) {
      console.error('Get sales chart data error:', error)
      return { data: null, error }
    }
  }

  // ดึง Top 5 สินค้าขายดี
  const getTopProducts = async (limit: number = 5) => {
    try {
      const { data: orderItems, error } = await $supabase
        .from('order_items')
        .select(`
          quantity,
          price,
          product_id,
          products (
            name
          )
        `)

      if (error) throw error

      // รวมยอดขายแต่ละสินค้า
      const productSales: Record<string, { name: string; total: number }> = {}

      orderItems?.forEach((item: any) => {
        if (item.products) {
          const productId = item.product_id
          const productName = item.products.name
          const price = parseFloat(item.price) || 0
          const quantity = item.quantity || 0
          const sales = price * quantity

          if (!productSales[productId]) {
            productSales[productId] = { name: productName, total: 0 }
          }
          productSales[productId].total += sales
        }
      })

      // เรียงและเอา Top limit
      const sorted = Object.values(productSales)
        .sort((a, b) => b.total - a.total)
        .slice(0, limit)

      const names = sorted.map(p => p.name)
      const sales = sorted.map(p => p.total)

      return { data: { names, sales }, error: null }
    } catch (error) {
      console.error('Get top products error:', error)
      // ถ้าไม่มีข้อมูล return ค่าว่าง
      return { data: { names: [], sales: [] }, error: null }
    }
  }

  // ดึงข้อมูล Dashboard ทั้งหมดพร้อมกัน
  const getAllDashboardData = async () => {
    try {
      const [orders, stats, chartData, topProducts] = await Promise.all([
        getRecentOrders(10),
        getDashboardStats(),
        getSalesChartData(7),
        getTopProducts(5)
      ])

      return {
        data: {
          recentOrders: orders.data || [],
          stats: stats.data || {
            totalSales: 0,
            newOrdersCount: 0,
            newCustomersCount: 0,
            totalStock: 0,
            lowStockCount: 0
          },
          chartData: chartData.data || { dates: [], sales: [] },
          topProducts: topProducts.data || { names: [], sales: [] }
        },
        error: null
      }
    } catch (error) {
      console.error('Get all dashboard data error:', error)
      return { data: null, error }
    }
  }

  return {
    getRecentOrders,
    getDashboardStats,
    getSalesChartData,
    getTopProducts,
    getAllDashboardData
  }
}