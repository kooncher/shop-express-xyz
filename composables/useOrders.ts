export const useOrders = () => {
  const { $supabase } = useNuxtApp()

  // Get all orders
  const getOrders = async (filters?: {
    status?: string
    payment_status?: string
    search?: string
  }) => {
    try {
      let query = $supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.payment_status) {
        query = query.eq('payment_status', filters.payment_status)
      }

      if (filters?.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get orders error:', error)
      return { data: null, error }
    }
  }

  // Get single order with items
  const getOrder = async (id: string) => {
    try {
      const { data: order, error: orderError } = await $supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      if (orderError) throw orderError

      const { data: items, error: itemsError } = await $supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)

      if (itemsError) throw itemsError

      return { data: { ...order, items }, error: null }
    } catch (error) {
      console.error('Get order error:', error)
      return { data: null, error }
    }
  }

  // Create order - แก้ไขส่วนนี้
  const createOrder = async (orderData: any) => {
    try {
      const { items, ...order } = orderData

      // สร้าง order ก่อน (ไม่รวม items)
      const { data: newOrder, error: orderError } = await $supabase
        .from('orders')
        .insert([{
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          payment_method: order.payment_method,
          status: order.status || 'pending',
          payment_status: order.payment_status || 'unpaid',
          subtotal: order.subtotal || 0,
          discount: order.discount || 0,
          shipping_fee: order.shipping_fee || 0,
          total: order.total || 0,
          notes: order.notes || ''
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // สร้าง order items (ถ้ามี)
      if (items && items.length > 0) {
        const orderItems = items.map((item: any) => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price
        }))

        const { error: itemsError } = await $supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      }

      return { data: newOrder, error: null }
    } catch (error) {
      console.error('Create order error:', error)
      return { data: null, error }
    }
  }

  // Update order - แก้ไขส่วนนี้
  const updateOrder = async (id: string, updates: any) => {
    try {
      // แยก items ออกจาก updates
      const { items, ...orderUpdates } = updates

      // Update order
      const { data, error } = await $supabase
        .from('orders')
        .update({ 
          ...orderUpdates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // ถ้ามี items ให้ลบของเก่าแล้วเพิ่มใหม่
      if (items && items.length > 0) {
        // ลบ items เก่า
        await $supabase
          .from('order_items')
          .delete()
          .eq('order_id', id)

        // เพิ่ม items ใหม่
        const orderItems = items.map((item: any) => ({
          order_id: id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku || '',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.quantity * item.price
        }))

        await $supabase
          .from('order_items')
          .insert(orderItems)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Update order error:', error)
      return { data: null, error }
    }
  }

  // Update order status
  const updateOrderStatus = async (id: string, status: string) => {
    return updateOrder(id, { status })
  }

  // Update payment status
  const updatePaymentStatus = async (id: string, payment_status: string) => {
    return updateOrder(id, { payment_status })
  }

  // Delete order
  const deleteOrder = async (id: string) => {
    try {
      // order_items จะถูกลบอัตโนมัติเพราะมี ON DELETE CASCADE
      const { error } = await $supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      console.error('Delete order error:', error)
      return { error }
    }
  }

  // Get customers
  const getCustomers = async () => {
    try {
      const { data, error } = await $supabase
        .from('customers')
        .select('*')
        .order('name')

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get customers error:', error)
      return { data: null, error }
    }
  }

  return {
    getOrders,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    deleteOrder,
    getCustomers
  }
}