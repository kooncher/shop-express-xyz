export const useAuth = () => {
  const { $supabase } = useNuxtApp()
  const user = useState('user', () => null)
  const loading = useState('auth-loading', () => true)

  // Initialize auth - ตรวจสอบ session ที่มีอยู่
  const initAuth = async () => {
    try {
      loading.value = true
      
      const { data: { session }, error } = await $supabase.auth.getSession()
      
      if (error) throw error
      
      if (session?.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = {
          ...session.user,
          profile: profile || null
        }
      } else {
        user.value = null
      }
    } catch (error) {
      console.error('Init auth error:', error)
      user.value = null
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

        user.value = {
          ...session.user,
          profile: profile || null
        }
      } else {
        user.value = null
      }
    })
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await $supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await $supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()

        user.value = {
          ...data.user,
          profile: profile || null
        }
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await $supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        await $supabase.from('profiles').insert([
          {
            id: data.user.id,
            full_name: fullName,
            email: email,
          },
        ])
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
      navigateTo('/login')
      
      return { error: null }
    } catch (error: any) {
      return { error }
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