export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, initAuth } = useAuth()

  // 1. รอโหลด Auth และข้อมูล Profile
  if (!user.value) await initAuth()

  // ดึง Role จาก State ของ user (ซึ่งควรจะถูกอัปเดตตอน initAuth)
  const userRole = user.value?.profile?.role 

  // 2. ถ้ายังไม่ได้ Login
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 3. ถ้า Login แล้วจะไปหน้า Login
  if (user.value && to.path === '/login') {
    return navigateTo(userRole === 'admin' ? '/dashboard' : '/shop')
  }

  // 4. ป้องกัน Customer เข้าหน้า Admin
  const adminOnlyPaths = ['/dashboard', '/products', '/orders']
  const isTargetAdminPage = adminOnlyPaths.some(p => to.path.startsWith(p))

  if (isTargetAdminPage && userRole !== 'admin') {
    console.warn("สิทธิ์ไม่พอ! ปัจจุบันเป็น:", userRole)
    return navigateTo('/shop')
  }
})