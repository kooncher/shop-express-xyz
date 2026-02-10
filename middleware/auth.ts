// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, initAuth } = useAuth()

  // ✅ ถ้า Refresh หน้าจอ user จะเป็น null
  // ต้องสั่งให้ดึงข้อมูลใหม่จาก Session และ "รอ" (await) ให้เสร็จ
  if (!user.value) {
    await initAuth() 
  }

  // หลังจากดึงเสร็จ (ข้อมูลมาแล้ว) ค่อยเช็คว่ามีสิทธิ์เข้าหน้า Dashboard ไหม
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})