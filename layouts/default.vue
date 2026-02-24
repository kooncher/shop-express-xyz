<template>
  <div class="dashboard-layout">
    <aside class="sidebar-container">
      <slot name="sidebar" />
    </aside>

    <div class="main-wrapper">
      <nav class="navbar">
        <div class="nav-left">
          <div v-if="user?.profile?.role === 'admin'" class="breadcrumbs">
            </div>
        </div>

        <div class="nav-right">
          <NotificationBell v-if="user?.profile?.role === 'admin'" />

          <slot name="navbar-actions" />

          <div class="user-controls">
            <ClientOnly>
              <div class="user-info">
                <span class="u-name">{{ user?.email }}</span>
                <span v-if="user?.profile?.role === 'admin'" class="u-role-badge">ADMIN</span>
                <span v-else class="u-role-badge">CUSTOMER</span>
              </div>
            </ClientOnly>

            <button @click="handleLogout" class="btn-logout" title="ออกจากระบบ">
              <span class="icon">🚪</span>
              <span class="text">ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </nav>

      <main class="content-area">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">

const { user, signOut } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  const { error } = await signOut(); // ต้องมี await ตรงนี้
  if (error) {
    alert("เกิดข้อผิดพลาดในการออกจากระบบ: " + error.message);
  }
};
</script>

<style scoped>
/* เหลือแค่ CSS โครงสร้างหลัก (Layout/Navbar) */
.dashboard-layout { display: flex; min-height: 100vh; }
.main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #f9fafb; }
.navbar {
  height: 90px; background: #1e293b; display: flex;
  justify-content: space-between; align-items: center;
  padding: 0 1.5rem; position: sticky; top: 0; z-index: 100; color: white;
}
.nav-right { display: flex; align-items: center; gap: 1.25rem; }
.user-controls { display: flex; align-items: center; gap: 12px; border-left: 1px solid rgba(255, 255, 255, 0.1); padding-left: 12px; }
.user-info { display: flex; flex-direction: column; text-align: right; }
.u-name { font-size: 0.8rem; font-weight: 600; color: #f8fafc; }
.u-role-badge { font-size: 0.6rem; background: #facc15; color: #1e293b; padding: 1px 6px; border-radius: 4px; font-weight: 800; align-self: flex-end; }
.btn-logout { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; }

@media (max-width: 768px) {
  .btn-logout .text {
    display: none; /* ซ่อนตัวอักษร เหลือแค่ไอคอน 🚪 */
  }
  
  .btn-logout {
    padding: 8px 12px;
    aspect-ratio: 1; /* ทำเป็นปุ่มจตุรัส */
  }

  .nav-right {
    gap: 0.75rem; /* ลดระยะห่างระหว่างกระดิ่งกับปุ่ม logout */
  }
}

</style>