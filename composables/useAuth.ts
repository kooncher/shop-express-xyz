export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const user = useState('user', () => null)
  const loading = useState('auth-loading', () => true)

  // ประกาศ Cookie สำหรับเก็บ Role
  const roleCookie = useCookie('user-role', {
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
    path: '/'
  })

  // 1. Initialize Auth (เช็ค Session เมื่อโหลดหน้าเว็บ)
  const initAuth = async () => {
    try {
      loading.value = true
      const { data: { session } } = await $supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = { ...session.user, profile: profile || null }
        
        if (profile?.role) {
          roleCookie.value = profile.role
        }
      }
    } catch (error) {
      console.error("Init Auth Error:", error)
    } finally {
      loading.value = false
    }
  }

  // 2. Auth Listener (ดักฟังการเปลี่ยนแปลงสถานะ Login/Logout)
  const setupAuthListener = () => {
    $supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = { ...session.user, profile: profile || null }
        if (profile?.role) roleCookie.value = profile.role
      } else {
        user.value = null
        roleCookie.value = null
      }
    })
  }

  // 3. Login
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await $supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      if (data.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        user.value = { ...data.user, profile: profile || null }
        if (profile?.role) roleCookie.value = profile.role
      }
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  // 4. Logout
  const signOut = async () => {
    try {
      const { error } = await $supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      roleCookie.value = null 
      window.location.href = '/login'
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  // 5. Register (เวอร์ชันแก้บั๊กและเพิ่ม Phone/Address)
const signUp = async (email: string, password: string, fullName: string, phone: string, address: string) => {
  try {
    // 1. สร้าง User ในระบบ Authentication
    const { data, error } = await $supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          phone: phone 
        } 
      },
    })

    if (error) throw error

    if (data.user) {
      // 2. ใช้ .upsert แทน .insert เพื่อป้องกันปัญหา Duplicate Key และบังคับให้รอ (await)
      const { error: profileError } = await $supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          phone: phone,      // บันทึกเบอร์โทร
          address: address,  // บันทึกที่อยู่
          role: 'customer'
        })

      if (profileError) {
        console.error("Profile Insert Error:", profileError)
        throw profileError
      }

      // 3. อัปเดต state ทันที
      user.value = { 
        ...data.user, 
        profile: { full_name: fullName, email, phone, address, role: 'customer' } 
      }
      roleCookie.value = 'customer'
    }

    return { data, error: null }

  } catch (error: any) {
    console.error("SignUp Catch Error:", error.message)
    return { data: null, error }
  }
}

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    initAuth,
    setupAuthListener
  }
}