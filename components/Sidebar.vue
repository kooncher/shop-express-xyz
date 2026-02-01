<template>
  <aside class="sidebar" :class="{ 
    collapsed: isCollapsed,
    'mobile-open': isMobileOpen 
  }">
    <!-- Header -->
   

    <div class="sidebar-header">
  <div class="brand" v-if="!isCollapsed || isMobile">
    <span class="brand-icon">🏪</span>
    <span class="brand-name">{{ shopName }}</span>
  </div>
  <button @click="toggleSidebar" class="menu-toggle">
    <span class="hamburger" :class="{ 'rotate-45': isMobileOpen }"></span>
    <span class="hamburger" v-if="!isMobileOpen"></span>
    <span class="hamburger" :class="{ '-rotate-45': isMobileOpen }"></span>
  </button>
</div>

    <!-- User Section (at top) -->
    <div class="user-section" @click="toggleUserMenu">
      <div class="user-avatar">{{ user?.avatar }}</div>
      <div class="user-info" v-if="!isCollapsed">
        <p class="user-name">{{ user?.name }}</p>
        <p class="user-email">{{ user?.email }}</p>
      </div>
    </div>

    <!-- User Menu Dropdown -->
    <div v-if="showUserMenu && !isCollapsed" class="user-menu">
      <button @click="handleLogout" class="user-menu-item logout">
        <span>🚪</span>
        <span>ออกจากระบบ</span>
      </button>
    </div>

    <!-- Menu Items -->
    <nav class="sidebar-menu">
      <button
        v-for="item in menuItems"
        :key="item.id"
        @click="handleItemClick(item)"
        :class="['menu-item', { active: isActive(item.id) }]"
      >
        <span class="menu-icon">{{ item.icon }}</span>
        <span class="menu-label" v-if="!isCollapsed">{{ item.label }}</span>
      </button>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface MenuItem {
  id: string
  label: string
  icon: string
}

interface UserData {
  name: string
  email: string
  avatar: string
}

interface Props {
  menuItems: MenuItem[]
  user: UserData
  isMobileOpen?: boolean // เพิ่ม prop นี้
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [isCollapsed: boolean]
  logout: []
  itemClick: [item: MenuItem] // เพิ่ม emit นี้
  closeMobile: [] // เพิ่ม emit นี้
}>()

const route = useRoute()
const { getShopSettings } = useSettings()

const isCollapsed = ref(false)
const showUserMenu = ref(false)
const shopName = ref('Dashboard')

// โหลดชื่อร้าน
const loadShopName = async () => {
  const { data } = await getShopSettings()
  if (data?.shop_name) {
    shopName.value = data.shop_name
  }
}

// ตรวจสอบว่า menu item ไหน active
const isActive = (itemId: string) => {
  const path = route.path
  
  if (itemId === 'home' && path === '/dashboard') return true
  if (itemId === 'products' && path === '/products') return true
  if (itemId === 'orders' && path === '/orders') return true
  if (itemId === 'customers' && path === '/customers') return true
  if (itemId === 'reports' && path === '/reports') return true
  if (itemId === 'settings' && path === '/settings') return true
  
  return false
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle', isCollapsed.value)
}

// แก้ไขตรงนี้ - navigate และ emit
const handleItemClick = (item: MenuItem) => {
  showUserMenu.value = false
  
  // Emit ให้ parent (Dashboard) จัดการ
  emit('itemClick', item)
  emit('closeMobile')
  
  // Navigate โดยตรง
  if (item.id === 'home') {
    navigateTo('/dashboard')
  } else if (item.id === 'products') {
    navigateTo('/products')
  } else if (item.id === 'orders') {
    navigateTo('/orders')
  } else if (item.id === 'customers') {
    navigateTo('/customers')
  } else if (item.id === 'reports') {
    navigateTo('/reports')
  } else if (item.id === 'settings') {
    navigateTo('/settings')
  }
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = () => {
  emit('logout')
}

onMounted(() => {
  loadShopName()
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 300px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  z-index: 1000;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.sidebar.collapsed {
  width: 80px;
}

/* Header Section */
.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-toggle {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 0.5rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.menu-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger {
  width: 24px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.user-section:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar.collapsed .user-section {
  justify-content: center;
  padding: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0.125rem;
}

.user-email {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User Menu Dropdown */
.user-menu {
  position: absolute;
  top: 100%;
  left: 1.5rem;
  right: 1.5rem;
  background: #2d3748;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-top: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 10;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 0.875rem;
}

.user-menu-item:hover {
  background: rgba(239, 68, 68, 0.2);
}

.user-menu-item.logout {
  color: #fca5a5;
}

/* Menu Items */
.sidebar-menu {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(2px);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  border-left: 3px solid #667eea;
}

.menu-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.menu-label {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 0.875rem;
}

.sidebar.collapsed .menu-item.active {
  border-left: none;
  border-bottom: 3px solid #667eea;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .sidebar {
    /* ซ่อนนอกจอทางซ้าย */
    transform: translateX(-100%);
    box-shadow: none;
    /* กำหนดขนาดเต็มเสมอใน mobile */
    width: 280px !important;
  }

  /* เมื่อเปิด sidebar ใน mobile */
  .sidebar.mobile-open {
    transform: translateX(0) !important;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  }
  
  /* ยกเลิก collapsed mode ใน mobile */
  .sidebar.collapsed {
    width: 280px !important;
    transform: translateX(-100%);
  }
  
  .sidebar.collapsed.mobile-open {
    transform: translateX(0) !important;
  }
  
  /* แสดงข้อมูลเต็มเสมอใน mobile */
  .sidebar.collapsed .brand {
    display: flex !important;
  }
  
  .sidebar.collapsed .user-info {
    display: block !important;
  }
  
  .sidebar.collapsed .menu-label {
    display: inline !important;
  }
  
  .sidebar.collapsed .menu-item {
    justify-content: flex-start;
    padding: 0.875rem 1rem;
  }
  
  .sidebar.collapsed .user-section {
    justify-content: flex-start;
    padding: 1rem 1.5rem;
  }
  
  .sidebar.collapsed .menu-item.active {
    border-left: 3px solid #667eea;
    border-bottom: none;
  }
}

/* Desktop - ปุ่ม Hamburger ยังใช้งานได้ */
@media (min-width: 769px) {
  .sidebar {
    /* Sidebar แสดงปกติ */
    transform: translateX(0);
  }
  
  /* เมื่อกดปุ่ม Hamburger ใน Desktop ก็ซ่อนได้ */
  .sidebar.mobile-open {
    transform: translateX(0);
  }
}
@media (max-width: 768px) {
  /* ซ่อนปุ่ม Hamburger เดิมที่อยู่ในแถบ Sidebar เมื่อดูผ่านมือถือ */
  .sidebar-header .menu-toggle {
    display: none;
  }
  
  /* ปรับให้ Logo ชิดซ้ายสวยงาม */
  .sidebar-header {
    justify-content: flex-start;
  }
}


</style>