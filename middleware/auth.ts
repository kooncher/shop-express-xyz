export default defineNuxtRouteMiddleware(async (to, from) => {
  // ทำงานเฉพาะฝั่ง client
  if (process.server) return

  const { user } = useAuth()

  // รอให้ user state โหลดเสร็จ (กรณีที่ยังไม่ได้ initAuth)
  await nextTick()

  // ตรวจสอบว่ามี user หรือไม่
  if (!user.value) {
    return navigateTo('/login', { replace: true })
  }
})