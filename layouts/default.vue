<template>
  <div class="app-layout">
    <button @click="handleLogout" class="floating-logout-btn" title="ออกจากระบบ">
      <span class="logout-icon">🚪</span>
      <span class="logout-text">ออกจากระบบ</span>
    </button>

    <slot />
  </div>
</template>

<script setup lang="ts">
const { signOut } = useAuth() // ใช้ฟังก์ชัน signOut จาก useAuth composable ของคุณ

const handleLogout = async () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    try {
      // 1. สั่ง Sign Out กับ Supabase (เคลียร์ Session ใน Auth)
      await signOut();

      // 2. เคลียร์ข้อมูลใน LocalStorage/Cookie (ถ้ามีการเก็บไว้เอง)
      localStorage.clear();
      sessionStorage.clear();

      // 3. ใช้การ Force Reload เพื่อล้าง State ของ Vue/Nuxt ทั้งหมด
      // แทนการใช้ navigateTo('/login') ให้ใช้บรรทัดนี้แทน:
      window.location.href = '/login'; 
      
    } catch (err) {
      console.error('Logout failed:', err);
      // กรณี Error ก็ยังควรจะผลัก user ออกไปหน้า login
      window.location.href = '/login';
    }
  }
};
</script>

<style scoped>
.floating-logout-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999; /* ให้อยู่เหนือทุกอย่าง */
  
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  color: #ef4444; /* สีแดงเข้ม */
  border: 1px solid #fee2e2;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-logout-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}

.logout-icon {
  font-size: 1.2rem;
}

/* ซ่อนตัวหนังสือบนมือถือเพื่อให้ไม่เกะกะ */
@media (max-width: 640px) {
  .logout-text {
    display: none;
  }
  .floating-logout-btn {
    padding: 12px;
    top: 15px;
    right: 15px;
  }
}
</style>