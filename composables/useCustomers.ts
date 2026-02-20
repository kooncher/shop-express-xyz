export const useCustomers = () => {
  const { $supabase } = useNuxtApp()

  // 1. ดึงข้อมูลลูกค้าทั้งหมด (Role: customer) มาแสดงในตาราง
  const getCustomers = async (filters: any = {}) => {
    let query = $supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        total_orders,
        total_spent,
        last_order_date,
        created_at,
        role
      `)
      .eq('role', 'customer')

    // ระบบค้นหา (Search)
    if (filters.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    // Mapping ข้อมูลให้เข้ากับหน้า Template (.vue)
    const mappedData = data?.map(user => ({
      ...user,
      name: user.full_name, // เปลี่ยนจาก full_name เป็น name เพื่อให้ตารางแสดงผล
      status: user.status || 'active',
      total_orders: user.total_orders || 0,
      total_spent: user.total_spent || 0
    }))

    return { data: mappedData, error }
  }

  // 2. ดึงสถิติรวม 4 กล่องด้านบน
  const getCustomerStats = async () => {
    try {
      const { data, error } = await $supabase
        .from('profiles')
        .select('status, total_orders, total_spent')
        .eq('role', 'customer')

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        active: data?.filter((c: any) => c.status === 'active').length || 0,
        inactive: data?.filter((c: any) => c.status === 'inactive').length || 0,
        withOrders: data?.filter((c: any) => (c.total_orders || 0) > 0).length || 0,
        totalRevenue: data?.reduce((sum: number, c: any) => sum + Number(c.total_spent || 0), 0) || 0
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Get stats error:', error)
      return { data: null, error }
    }
  }

  // 3. เพิ่มลูกค้าใหม่เข้าตาราง profiles
  const createCustomer = async (customerData: any) => {
    const { data, error } = await $supabase
      .from('profiles')
      .insert([{
        full_name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        role: 'customer',
        status: customerData.status || 'active',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    return { data, error }
  }

  // 4. อัปเดตข้อมูลลูกค้า
  const updateCustomer = async (id: string, updates: any) => {
    const { data, error } = await $supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        email: updates.email,
        phone: updates.phone,
        status: updates.status
      })
      .eq('id', id)
      .select()
      .single()
    return { data, error }
  }

  // 5. ลบลูกค้า
  const deleteCustomer = async (id: string) => {
    const { error } = await $supabase
      .from('profiles')
      .delete()
      .eq('id', id)
    return { error }
  }

  return {
    getCustomers,
    getCustomerStats,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
}