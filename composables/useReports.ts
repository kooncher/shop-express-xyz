export const useReports = () => {
  const { $supabase } = useNuxtApp()

  // Get dashboard overview stats
  const getDashboardStats = async () => {
    try {
      // ดึงข้อมูลคำสั่งซื้อทั้งหมด
      const { data: orders, error: ordersError } = await $supabase
        .from('orders')
        .select('*')

      if (ordersError) throw ordersError

      // ดึงข้อมูลสินค้า
      const { data: products, error: productsError } = await $supabase
        .from('products')
        .select('*')

      if (productsError) throw productsError

      // ดึงข้อมูลลูกค้า
      const { data: customers, error: customersError } = await $supabase
        .from('customers')
        .select('*')

      if (customersError) throw customersError

      // คำนวณสถิติ
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
      
      const totalRevenue = orders
        ?.filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + (order.total || 0), 0) || 0

      const totalProducts = products?.length || 0
      const lowStockProducts = products?.filter(p => p.stock <= p.min_stock).length || 0
      
      const totalCustomers = customers?.length || 0
      const activeCustomers = customers?.filter(c => c.total_orders > 0).length || 0

      return {
        data: {
          totalOrders,
          completedOrders,
          pendingOrders,
          totalRevenue,
          totalProducts,
          lowStockProducts,
          totalCustomers,
          activeCustomers
        },
        error: null
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return { data: null, error }
    }
  }

  // Get sales data for the last 7 days
  const getRecentSales = async (days = 7) => {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await $supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by date
      const salesByDate: any = {}
      const last7Days = []
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        last7Days.push(dateStr)
        salesByDate[dateStr] = 0
      }

      data?.forEach((order: any) => {
        const dateStr = order.created_at.split('T')[0]
        if (salesByDate[dateStr] !== undefined) {
          salesByDate[dateStr] += order.total || 0
        }
      })

      const chartData = last7Days.map(date => ({
        date,
        total: salesByDate[date]
      }))

      return { data: chartData, error: null }
    } catch (error) {
      console.error('Get recent sales error:', error)
      return { data: null, error }
    }
  }

  // Get top selling products
  const getTopProducts = async (limit = 5) => {
    try {
      const { data, error } = await $supabase
        .from('order_items')
        .select('product_name, quantity, price')

      if (error) throw error

      // Group by product
      const productStats: any = {}
      
      data?.forEach((item: any) => {
        const name = item.product_name
        if (!productStats[name]) {
          productStats[name] = {
            name,
            quantity: 0,
            revenue: 0
          }
        }
        productStats[name].quantity += item.quantity
        productStats[name].revenue += item.quantity * item.price
      })

      // Sort by quantity and take top N
      const topProducts = Object.values(productStats)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, limit)

      return { data: topProducts, error: null }
    } catch (error) {
      console.error('Get top products error:', error)
      return { data: null, error }
    }
  }

  // Get recent orders
  const getRecentOrders = async (limit = 10) => {
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

  // Get order status distribution
  const getOrderStatusDistribution = async () => {
    try {
      const { data, error } = await $supabase
        .from('orders')
        .select('status')

      if (error) throw error

      const distribution: any = {
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipping: 0,
        completed: 0,
        cancelled: 0
      }
      
      data?.forEach((order: any) => {
        if (distribution[order.status] !== undefined) {
          distribution[order.status]++
        }
      })

      return { data: distribution, error: null }
    } catch (error) {
      console.error('Get order status distribution error:', error)
      return { data: null, error }
    }
  }

  return {
    getDashboardStats,
    getRecentSales,
    getTopProducts,
    getRecentOrders,
    getOrderStatusDistribution
  }
}