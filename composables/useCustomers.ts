export const useCustomers = () => {
  const { $supabase } = useNuxtApp()

  // Get all customers
  const getCustomers = async (filters?: {
    status?: string
    search?: string
  }) => {
    try {
      let query = $supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get customers error:', error)
      return { data: null, error }
    }
  }

  // Get single customer with orders
  const getCustomer = async (id: string) => {
    try {
      const { data: customer, error: customerError } = await $supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (customerError) throw customerError

      // ดึงคำสั่งซื้อของลูกค้า
      const { data: orders, error: ordersError } = await $supabase
        .from('orders')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      return { data: { ...customer, orders }, error: null }
    } catch (error) {
      console.error('Get customer error:', error)
      return { data: null, error }
    }
  }

  // Create customer
  const createCustomer = async (customerData: any) => {
    try {
      const { data, error } = await $supabase
        .from('customers')
        .insert([{
          name: customerData.name,
          email: customerData.email || null,
          phone: customerData.phone || null,
          address: customerData.address || null,
          status: customerData.status || 'active'
        }])
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Create customer error:', error)
      return { data: null, error }
    }
  }

  // Update customer
  const updateCustomer = async (id: string, updates: any) => {
    try {
      const { data, error } = await $supabase
        .from('customers')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update customer error:', error)
      return { data: null, error }
    }
  }

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await $supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete customer error:', error)
      return { error }
    }
  }

  // Get customer statistics
  const getCustomerStats = async () => {
    try {
      const { data, error } = await $supabase
        .from('customers')
        .select('status, total_orders, total_spent')

      if (error) throw error

      const stats = {
        total: data?.length || 0,
        active: data?.filter((c: any) => c.status === 'active').length || 0,
        inactive: data?.filter((c: any) => c.status === 'inactive').length || 0,
        withOrders: data?.filter((c: any) => c.total_orders > 0).length || 0,
        totalRevenue: data?.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0) || 0
      }

      return { data: stats, error: null }
    } catch (error) {
      console.error('Get customer stats error:', error)
      return { data: null, error }
    }
  }

  return {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
  }
}
