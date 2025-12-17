// middleware/guest.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, checkAuth, loading } = useAuth()

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

  // Redirect to dashboard if already authenticated
  if (user.value) {
    return navigateTo('/dashboard')
  }
})
