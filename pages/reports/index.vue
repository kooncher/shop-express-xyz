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
            <h1 class="page-title">รายงานและสถิติ</h1>
            <p class="page-subtitle">ภาพรวมธุรกิจและการวิเคราะห์ข้อมูล</p>
          </div>
          
          <div class="date-filter">

          <button @click="exportToExcel" class="btn-export" :disabled="loading">
    <span>📊</span>
    <span>ส่งออก Excel</span>
  </button>
            <button @click="loadData" class="btn-refresh">
              <span>🔄</span>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Main Stats -->
        <div v-else>
          <div class="stats-grid">
            <div class="stat-card revenue">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <p class="stat-label">รายได้รวม</p>
                <p class="stat-value">฿{{ formatNumber(stats.totalRevenue) }}</p>
                <p class="stat-change positive">จากคำสั่งซื้อที่สำเร็จ</p>
              </div>
            </div>

            <div class="stat-card orders">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <p class="stat-label">คำสั่งซื้อทั้งหมด</p>
                <p class="stat-value">{{ stats.totalOrders }}</p>
                <p class="stat-change">{{ stats.completedOrders }} สำเร็จ</p>
              </div>
            </div>

            <div class="stat-card products">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <p class="stat-label">สินค้าทั้งหมด</p>
                <p class="stat-value">{{ stats.totalProducts }}</p>
                <p class="stat-change warning" v-if="stats.lowStockProducts > 0">
                  {{ stats.lowStockProducts }} ใกล้หมด
                </p>
                <p class="stat-change" v-else>สต็อกปกติ</p>
              </div>
            </div>

            <div class="stat-card customers">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <p class="stat-label">ลูกค้าทั้งหมด</p>
                <p class="stat-value">{{ stats.totalCustomers }}</p>
                <p class="stat-change">{{ stats.activeCustomers }} ที่ซื้อแล้ว</p>
              </div>
            </div>
          </div>

          <!-- Sales Chart -->
          <div class="card">
            <h2 class="card-title">ยอดขาย 7 วันล่าสุด</h2>
            <div class="chart-container">
              <div class="simple-chart">
                <div v-for="(item, index) in salesData" :key="index" class="chart-bar-wrapper">
                  <div class="chart-bar">
                    <div 
                      class="chart-bar-fill" 
                      :style="{ height: getBarHeight(item.total) + '%' }"
                    >
                      <span class="bar-value">฿{{ formatShortNumber(item.total) }}</span>
                    </div>
                  </div>
                  <span class="chart-label">{{ formatChartDate(item.date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="two-column-layout">
            <!-- Top Products -->
            <div class="card">
              <h2 class="card-title">สินค้าขายดี Top 5</h2>
              <div class="top-products-list">
                <div v-if="topProducts.length === 0" class="empty-message">
                  ยังไม่มีข้อมูลการขาย
                </div>
                <div v-else v-for="(product, index) in topProducts" :key="index" class="product-item">
                  <div class="product-rank">{{ index + 1 }}</div>
                  <div class="product-info">
                    <p class="product-name">{{ product.name }}</p>
                    <p class="product-stats">
                      ขายได้ {{ product.quantity }} ชิ้น · ฿{{ formatNumber(product.revenue) }}
                    </p>
                  </div>
                  <div class="product-bar">
                    <div 
                      class="product-bar-fill" 
                      :style="{ width: getProductBarWidth(product.quantity) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Status -->
            <div class="card">
              <h2 class="card-title">สถานะคำสั่งซื้อ</h2>
              <div class="status-list">
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot pending"></span>
                    <span class="status-label">รอดำเนินการ</span>
                  </div>
                  <span class="status-count">{{ orderStatus.pending }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot confirmed"></span>
                    <span class="status-label">ยืนยันแล้ว</span>
                  </div>
                  <span class="status-count">{{ orderStatus.confirmed }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot processing"></span>
                    <span class="status-label">กำลังเตรียม</span>
                  </div>
                  <span class="status-count">{{ orderStatus.processing }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot shipping"></span>
                    <span class="status-label">กำลังจัดส่ง</span>
                  </div>
                  <span class="status-count">{{ orderStatus.shipping }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot completed"></span>
                    <span class="status-label">สำเร็จแล้ว</span>
                  </div>
                  <span class="status-count">{{ orderStatus.completed }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot cancelled"></span>
                    <span class="status-label">ยกเลิก</span>
                  </div>
                  <span class="status-count">{{ orderStatus.cancelled }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
          <div class="card">
            <h2 class="card-title">คำสั่งซื้อล่าสุด</h2>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>เลขที่</th>
                    <th>ลูกค้า</th>
                    <th>ยอดรวม</th>
                    <th>สถานะ</th>
                    <th>วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="recentOrders.length === 0">
                    <td colspan="5" class="text-center text-muted">ยังไม่มีคำสั่งซื้อ</td>
                  </tr>
                  <tr v-else v-for="order in recentOrders" :key="order.id">
                    <td class="font-semibold">{{ order.order_number }}</td>
                    <td>{{ order.customer_name }}</td>
                    <td class="font-semibold">฿{{ formatNumber(order.total) }}</td>
                    <td>
                      <span :class="['badge', getStatusClass(order.status)]">
                        {{ getStatusLabel(order.status) }}
                      </span>
                    </td>
                    <td class="text-muted">{{ formatDate(order.created_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
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

const { user } = useAuth()
const { 
  getDashboardStats, 
  getRecentSales, 
  getTopProducts, 
  getRecentOrders,
  getOrderStatusDistribution 
} = useReports()

const isSidebarCollapsed = ref(false)
const loading = ref(true)

const stats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  completedOrders: 0,
  pendingOrders: 0,
  totalProducts: 0,
  lowStockProducts: 0,
  totalCustomers: 0,
  activeCustomers: 0
})

const salesData = ref<any[]>([])
const topProducts = ref<any[]>([])
const recentOrders = ref<any[]>([])
const orderStatus = ref({
  pending: 0,
  confirmed: 0,
  processing: 0,
  shipping: 0,
  completed: 0,
  cancelled: 0
})

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

// Load all data
const loadData = async () => {
  loading.value = true
  
  try {
    // Load dashboard stats
    const { data: statsData } = await getDashboardStats()
    if (statsData) {
      stats.value = statsData
    }

    // Load sales data
    const { data: sales } = await getRecentSales(7)
    if (sales) {
      salesData.value = sales
    }

    // Load top products
    const { data: products } = await getTopProducts(5)
    if (products) {
      topProducts.value = products
    }

    // Load recent orders
    const { data: orders } = await getRecentOrders(10)
    if (orders) {
      recentOrders.value = orders
    }

    // Load order status distribution
    const { data: status } = await getOrderStatusDistribution()
    if (status) {
      orderStatus.value = status
    }
  } finally {
    loading.value = false
  }
}
import * as XLSX from 'xlsx'

const exportToExcel = () => {
  const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  // ใช้ 'en-GB' จะได้ dd/mm/yyyy
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
  if (recentOrders.value.length === 0) {
    alert('ไม่มีข้อมูลสำหรับส่งออก')
    return
  }

  // 1. เตรียมข้อมูล (เรียกใช้ formatDate ที่เราแก้แล้ว)
  const data = recentOrders.value.map(order => ({
    'เลขที่คำสั่งซื้อ': order.order_number,
    'ชื่อลูกค้า': order.customer_name,
    'ยอดรวม (บาท)': order.total,
    'สถานะ': getStatusLabel(order.status),
    'วันที่สั่งซื้อ': formatDate(order.created_at) // จะได้ dd/mm/yyyy
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'คำสั่งซื้อ')

  const wscols = [
    { wch: 20 }, // เลขที่
    { wch: 30 }, // ชื่อลูกค้า
    { wch: 15 }, // ยอดรวม
    { wch: 20 }, // สถานะ
    { wch: 15 }  // วันที่
  ]
  worksheet['!cols'] = wscols

  // 2. ปรับชื่อไฟล์ให้เป็น วัน-เดือน-ปี แบบไทย
  const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-') 
  // ผลลัพธ์จะเป็น "31-01-2024"
  
  XLSX.writeFile(workbook, `สรุปยอดขาย_${today}.xlsx`)
}
// Helper functions
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const formatShortNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toFixed(0)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatChartDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short'
  })
}

const getBarHeight = (value: number) => {
  const maxValue = Math.max(...salesData.value.map(item => item.total), 1)
  return (value / maxValue) * 100
}

const getProductBarWidth = (quantity: number) => {
  const maxQuantity = Math.max(...topProducts.value.map(p => p.quantity), 1)
  return (quantity / maxQuantity) * 100
}

const getStatusClass = (status: string) => {
  const classes: any = {
    pending: 'warning',
    confirmed: 'info',
    processing: 'info',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return classes[status] || 'secondary'
}

const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: 'รอดำเนินการ',
    confirmed: 'ยืนยันแล้ว',
    processing: 'กำลังเตรียมสินค้า',
    shipping: 'กำลังจัดส่ง',
    completed: 'สำเร็จแล้ว',
    cancelled: 'ยกเลิก'
  }
  return labels[status] || status
}

const handleMenuClick = (item: any) => {
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

const handleToggle = (isCollapsed: boolean) => {
  isSidebarCollapsed.value = isCollapsed
}

// Initialize
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f9fafb;
}

.main-content {
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
  display: flex;
  justify-content: center;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
}

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

.date-filter {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-card.revenue .stat-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-card.orders .stat-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-card.products .stat-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-card.customers .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.warning {
  color: #f59e0b;
}

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
  margin-bottom: 1.5rem;
}

.chart-container {
  height: 300px;
  margin-top: 1rem;
}

.simple-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
  padding: 1rem 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.chart-bar {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.chart-bar-fill {
  width: 100%;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
  position: relative;
}

.chart-bar-fill:hover {
  opacity: 0.8;
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.chart-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.two-column-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.product-item:hover {
  background: #f3f4f6;
}

.product-rank {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.product-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.product-bar {
  width: 100px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.product-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 9999px;
  transition: width 0.3s;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.pending {
  background: #fbbf24;
}

.status-dot.confirmed {
  background: #60a5fa;
}

.status-dot.processing {
  background: #818cf8;
}

.status-dot.shipping {
  background: #a78bfa;
}

.status-dot.completed {
  background: #34d399;
}

.status-dot.cancelled {
  background: #f87171;
}

.status-label {
  font-weight: 500;
  color: #374151;
}

.status-count {
  font-weight: 700;
  font-size: 1.25rem;
  color: #111827;
}

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
  padding: 1rem;
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

.text-center {
  text-align: center;
}

.font-semibold {
  font-weight: 600;
}

.text-muted {
  color: #6b7280;
}

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

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.primary {
  background: #e0e7ff;
  color: #3730a3;
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981; /* สีเขียวสไตล์ Excel */
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>