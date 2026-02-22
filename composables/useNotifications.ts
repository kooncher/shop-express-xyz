// composables/useNotifications.ts
export const useNotifications = () => {
  const { $supabase } = useNuxtApp()
  const recentOrders = ref([])
  const hasNewOrder = ref(false)

  const fetchOrders = async () => {
    const { data, error } = await $supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
    if (!error) recentOrders.value = data
  }

  const setupRealtime = () => {
    const channel = $supabase
      .channel("public:orders")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, 
        (payload: any) => {
          recentOrders.value.unshift(payload.new)
          if (recentOrders.value.length > 5) recentOrders.value.pop()
          hasNewOrder.value = true
        })
      .subscribe()
    return channel
  }

  return { recentOrders, hasNewOrder, fetchOrders, setupRealtime }
}