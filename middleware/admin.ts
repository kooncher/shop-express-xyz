// middleware/admin.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, isAdmin, checkAuth, loading } = useAuth()

  // Check auth if not already checked
  if (!user.value && !loading.value) {
    await checkAuth()
  }

  // Wait for loading to finish
  if (loading.value) {
    await new Promise(resolve => {
      const unwatch = watch(loading, (newVal) => {
        if (!newVal) {
          unwatch()
          resolve(true)
        }
      })
    })
  }

  // Redirect to login if not authenticated
  if (!user.value) {
    return navigateTo('/login')
  }

  // Redirect to dashboard if not admin
  if (!isAdmin.value) {
    return navigateTo('/dashboard')
  }
})
