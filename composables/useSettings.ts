export const useSettings = () => {
  const { $supabase } = useNuxtApp()

  // Get user profile
  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await $supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get user profile error:', error)
      return { data: null, error }
    }
  }

  // Update user profile
  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { data, error } = await $supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Update user profile error:', error)
      return { data: null, error }
    }
  }

  // Change password
  const changePassword = async (newPassword: string) => {
    try {
      const { data, error } = await $supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Change password error:', error)
      return { data: null, error }
    }
  }

  // Get shop settings
  const getShopSettings = async () => {
    try {
      const { data, error } = await $supabase
        .from('shop_settings')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Get shop settings error:', error)
      return { data: null, error }
    }
  }

  // Update shop settings
  const updateShopSettings = async (settings: any) => {
    try {
      // ลอง select ก่อนว่ามีข้อมูลหรือยัง
      const { data: existing } = await $supabase
        .from('shop_settings')
        .select('id')
        .limit(1)
        .maybeSingle()

      let result

      if (existing?.id) {
        // Update existing
        result = await $supabase
          .from('shop_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        // Insert new
        result = await $supabase
          .from('shop_settings')
          .insert([{
            ...settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
      }

      if (result.error) throw result.error
      return { data: result.data, error: null }
    } catch (error) {
      console.error('Update shop settings error:', error)
      return { data: null, error }
    }
  }

  return {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getShopSettings,
    updateShopSettings
  }
}