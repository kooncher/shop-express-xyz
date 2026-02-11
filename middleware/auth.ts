// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return

  const { user, initAuth } = useAuth()
  
  // 1. รอให้ดึงข้อมูลจาก Session ให้เสร็จ (แก้ปัญหารีเฟรชแล้วค่าเป็น null)
  if (!user.value) {
    await initAuth()
  }

  // 2. ดึงค่า Role จาก Cookie มาเช็ค (กรณี SSR หรือรีเฟรชหน้า)
  const userRole = useCookie('user-role').value

  // 3. ตรวจสอบสถานะการ Login
  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // 4. เช็คสิทธิ์เฉพาะหน้า (ตัวอย่าง: หน้าจัดการสินค้าสำหรับ Admin เท่านั้น)
  if (to.path.startsWith('/products') && userRole !== 'admin') {
    return navigateTo('/shop') // ถ้าไม่ใช่ admin ให้ดีดไปหน้าร้านค้า
  }
})