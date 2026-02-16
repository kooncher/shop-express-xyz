export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const user = useState('user', () => null)
  const loading = useState('auth-loading', () => true)

  // 1. ✅ ต้องประกาศตัวแปร Cookie ไว้ตรงนี้เพื่อให้ทุกฟังก์ชันในนี้มองเห็น
  const roleCookie = useCookie('user-role', {
    maxAge: 60 * 60 * 24 * 7, // เก็บไว้ 7 วัน
    path: '/'                 // ให้เข้าถึงได้ทุกหน้า
  })

  // Initialize auth
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
        
        // 2. ✅ อัปเดต Cookie ตอน Initialize ด้วย (กันพลาดตอน Refresh หน้า)
        if (profile?.role) {
          roleCookie.value = profile.role
        }
      }
    } finally {
      loading.value = false
    }
  }

  // Listen to auth state changes
  const setupAuthListener = () => {
    $supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = { ...session.user, profile: profile || null }
        // ✅ อัปเดต Cookie เมื่อ State เปลี่ยน
        if (profile?.role) roleCookie.value = profile.role
      } else {
        user.value = null
        roleCookie.value = null // ✅ ล้างเมื่อ Logout
      }
    })
  }

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
        
        // ✅ อัปเดต Cookie ตอนล็อกอินสำเร็จ
        if (profile?.role) {
          roleCookie.value = profile.role
        }
      }
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await $supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      // ✅ ล้าง Cookie ทิ้งตอน Logout
      roleCookie.value = null 
      
      // ✅ ใช้ window.location เพื่อเคลียร์ทุกอย่างให้เกลี้ยง
      window.location.href = '/login'
      return { error: null }
    } catch (error: any) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await $supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })

      if (error) throw error

      if (data.user) {
        await $supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
            role: 'customer' // ✅ ควรกำหนดค่าเริ่มต้นให้เขาทุกครั้งที่สมัคร
          },
        ])
      }
      return { data, error: null }
    } catch (error: any) {
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