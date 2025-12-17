<template>
  <div class="dashboard-container">
       <Sidebar
      :menu-items="menuItems"
      :user="userData"
      @item-click="handleMenuClick"
      @toggle="handleToggle"
    />
    

    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ currentPage }}</h1>
            <p class="page-subtitle">ยินดีต้อนรับกลับมา, {{ user?.profile?.full_name || 'ผู้ใช้งาน' }}!</p>
          </div>
          
          <button @click="handleLogout" class="logout-btn">
            ออกจากระบบ
          </button>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">ยอดขายวันนี้</p>
                <p class="stat-value">฿12,580</p>
                <p class="stat-change positive">+12.5% จากเมื่อวาน</p>
              </div>
              <div class="stat-icon blue">
                <span>💰</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">คำสั่งซื้อใหม่</p>
                <p class="stat-value">45</p>
                <p class="stat-change positive">+8 จากเมื่อวาน</p>
              </div>
              <div class="stat-icon green">
                <span>📦</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">ลูกค้าใหม่</p>
                <p class="stat-value">28</p>
                <p class="stat-change neutral">สัปดาห์นี้</p>
              </div>
              <div class="stat-icon purple">
                <span>👥</span>
              </div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">สินค้าคงเหลือ</p>
                <p class="stat-value">1,234</p>
                <p class="stat-change warning">15 รายการใกล้หมด</p>
              </div>
              <div class="stat-icon orange">
                <span>📊</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <h2 class="card-title">การดำเนินการด่วน</h2>
          <div class="quick-actions">
            <button class="action-btn">
              <span class="action-icon">➕</span>
              <span class="action-label">เพิ่มสินค้า</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">📋</span>
              <span class="action-label">จัดการคำสั่งซื้อ</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">👥</span>
              <span class="action-label">จัดการลูกค้า</span>
            </button>
            <button class="action-btn">
              <span class="action-icon">📊</span>
              <span class="action-label">ดูรายงาน</span>
            </button>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="card">
          <h2 class="card-title">คำสั่งซื้อล่าสุด</h2>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>รหัสคำสั่งซื้อ</th>
                  <th>ลูกค้า</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                  <th>วันที่</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="font-semibold">#ORD-001</td>
                  <td>สมชาย ใจดี</td>
                  <td class="font-semibold">฿2,450</td>
                  <td>
                    <span class="badge success">ชำระแล้ว</span>
                  </td>
                  <td class="text-muted">10 พ.ย. 2567</td>
                </tr>
                <tr>
                  <td class="font-semibold">#ORD-002</td>
                  <td>สมหญิง รักดี</td>
                  <td class="font-semibold">฿1,890</td>
                  <td>
                    <span class="badge warning">รอชำระ</span>
                  </td>
                  <td class="text-muted">10 พ.ย. 2567</td>
                </tr>
                <tr>
                  <td class="font-semibold">#ORD-003</td>
                  <td>สมศักดิ์ มีสุข</td>
                  <td class="font-semibold">฿3,200</td>
                  <td>
                    <span class="badge info">กำลังจัดส่ง</span>
                  </td>
                  <td class="text-muted">9 พ.ย. 2567</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user, signOut } = useAuth()

const currentPage = ref('หน้าแรก')
const isSidebarCollapsed = ref(false)

const menuItems = ref([
  { id: 'home', label: 'หน้าแรก', icon: '🏠' },
  { id: 'products', label: 'สินค้า', icon: '📦' },
  { id: 'orders', label: 'คำสั่งซื้อ', icon: '📋' },
  { id: 'customers', label: 'ลูกค้า', icon: '👥' },
  { id: 'reports', label: 'รายงาน', icon: '📊' },
  { id: 'settings', label: 'ตั้งค่า', icon: '⚙️' }
])

const userData = computed(() => ({
  name: user.value?.profile?.full_name || 'ผู้ใช้งาน',
  email: user.value?.email || '',
  avatar: '👤'
}))

const handleMenuClick = (item: any) => {
  currentPage.value = item.label
  
  // Navigate to different pages
  if (item.id === 'home') {
    navigateTo('/dashboard')
  } else if (item.id === 'products') {
    navigateTo('/products')  // แก้เป็น /products แทน /product
  } else if (item.id === 'orders') {
    navigateTo('/orders')
  } else if (item.id === 'customers') {
    navigateTo('/customers')
  } else if (item.id === 'reports') {
    navigateTo('/reports')
    console.log('Navigate to reports (coming soon)')
  } else if (item.id === 'settings') {
    navigateTo('/settings')
    console.log('Navigate to settings (coming soon)')
  }
}

const handleToggle = (isCollapsed: boolean) => {
  isSidebarCollapsed.value = isCollapsed
}

const handleLogout = async () => {
  await signOut()
}
</script>
<<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  display: flex; /* เพิ่ม */
  justify-content: center; /* เพิ่ม */
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  width: 100%; /* เพิ่ม */
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.logout-btn {
  padding: 0.625rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.875rem;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.warning {
  color: #f59e0b;
}

.stat-change.neutral {
  color: #3b82f6;
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-icon.green {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-icon.purple {
  background: linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%);
}

.stat-icon.orange {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

/* Card */
.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}

.action-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
}

.action-label {
  font-weight: 500;
  color: #374151;
}

/* Table */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead tr {
  border-bottom: 2px solid #e5e7eb;
}

.data-table th {
  text-align: left;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.data-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.data-table td {
  padding: 1rem;
  font-size: 0.9rem;
  color: #111827;
}

.font-semibold {
  font-weight: 600;
}

.text-muted {
  color: #6b7280;
}

/* Badge */
.badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>