<template>
  <div class="dashboard-layout">
    <aside class="sidebar-container">
      <slot name="sidebar" />
    </aside>

    <div class="main-wrapper">
      <nav class="navbar">
        <div class="nav-left">
          <!-- <div class="breadcrumbs">
            <span class="root">ShopExpressXYZ</span>
            <span class="separator">/</span>
            <span class="current-page">เลือกซื้อสินค้า</span>
          </div> -->
        </div>
<!-- 
        <div class="nav-center">
          <div class="nav-search">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="ค้นหาข้อมูลอย่างรวดเร็ว..." />
          </div>
        </div> -->

        <div class="nav-right">
          <button class="nav-icon-btn">
            <span class="icon">🔔</span>
            <span class="dot"></span>
          </button>

          <slot name="navbar-actions" />

          <div class="user-controls">
            <ClientOnly>
              <div class="user-info">
                <span class="u-name">{{ user?.email }}</span>
                <span class="u-role">ADMIN</span>
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
const { user, signOut } = useAuth()

const handleLogout = async () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    try {
      await signOut()
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
      window.location.href = '/login'
    }
  }
}
</script>

<style scoped>
.dashboard-layout { display: flex; min-height: 100vh; }
.main-wrapper { flex: 1; display: flex; flex-direction: column; min-width: 0; background: #f9fafb; }

/* Navbar: ปรับเป็นสีเดียวกับ Sidebar เพื่อความต่อเนื่อง */
.navbar {
  height: 90px;
  background: #1e293b; /* สีน้ำเงินเข้มเดียวกับ Sidebar */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

/* Nav Left: Breadcrumbs */
.breadcrumbs { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }
.breadcrumbs .root { color: #94a3b8; }
.breadcrumbs .separator { color: #475569; }
.breadcrumbs .current-page { color: white; font-weight: 600; }

/* Nav Center: Search Bar */
.nav-center { flex: 1; max-width: 400px; margin: 0 20px; }
.nav-search { position: relative; width: 100%; }
.nav-search input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 8px 12px 8px 35px;
  color: white;
  outline: none;
  font-size: 0.9rem;
}
.nav-search .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.5; }

/* Nav Right */
.nav-right { display: flex; align-items: center; gap: 1.25rem; }

.nav-icon-btn { 
  background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; position: relative; 
}
.nav-icon-btn .dot {
  position: absolute; top: 0; right: 0; width: 7px; height: 7px; background: #ef4444; border-radius: 50%; border: 2px solid #1e293b;
}

.user-controls { display: flex; align-items: center; gap: 12px; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 12px; }
.user-info { display: flex; flex-direction: column; text-align: right; }
.u-name { font-size: 0.8rem; font-weight: 600; color: #f8fafc; }
.u-role { font-size: 0.65rem; color: #94a3b8; }

.btn-logout {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  background: #ef4444; color: white; border: none; border-radius: 8px;
  font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.2s;
}
.btn-logout:hover { background: #dc2626; transform: scale(1.02); }

/* Responsive */
@media (max-width: 1024px) {
  .nav-center, .breadcrumbs { display: none; }
}
@media (max-width: 768px) {
  .u-name, .btn-logout .text { display: none; }
  .navbar { padding: 0 1rem; }
}
</style>