export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, initAuth } = useAuth()
  const userRole = useCookie('user-role').value

  // 1. รอโหลด Auth
  if (!user.value) await initAuth()

  // 2. ถ้ายังไม่ได้ Login ให้ไปหน้า Login เท่านั้น
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 3. ถ้า Login แล้วแต่จะไปหน้า Login อีก ให้ดีดกลับไปหน้าหลัก
  if (user.value && to.path === '/login') {
    return navigateTo(userRole === 'admin' ? '/dashboard' : '/shop')
  }

  // 4. ป้องกัน Customer เข้าหน้า Admin
  const adminOnlyPaths = ['/dashboard', '/products', '/orders']
  const isTargetAdminPage = adminOnlyPaths.some(p => to.path.startsWith(p))

  if (isTargetAdminPage && userRole !== 'admin') {
    console.warn("สิทธิ์ไม่พอ! ดีดออกไปหน้า Shop")
    return navigateTo('/shop')
  }
})