<template>
  <div class="dashboard-container">
    <!-- Mobile Menu Button -->
    <button 
      @click="toggleMobileSidebar" 
      class="mobile-menu-btn"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Mobile Overlay -->
    <div 
      v-if="showMobileSidebar" 
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <Sidebar
      :menu-items="menuItems"
      :user="userData"
      :is-mobile-open="showMobileSidebar"
      @item-click="handleMenuClick"
      @toggle="handleToggle"
      @close-mobile="closeMobileSidebar"
    />

    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="page-header">
          <div class="header-text">
            <h1 class="page-title">{{ currentPage }}</h1>
            <p class="page-subtitle">ยินดีต้อนรับกลับมา, {{ user?.profile?.full_name || 'ผู้ใช้งาน' }}!</p>
          </div>
          
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">ออกจากระบบ</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Stats Cards -->
        <div v-else class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-info">
                <p class="stat-label">ยอดขายวันนี้</p>
                <p class="stat-value">฿{{ dashboardData.stats.totalSales.toLocaleString() }}</p>
                <p class="stat-change positive">จากคำสั่งซื้อที่ชำระแล้ว</p>
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
                <p class="stat-value">{{ dashboardData.stats.newOrdersCount }}</p>
                <p class="stat-change positive">วันนี้</p>
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
                <p class="stat-value">{{ dashboardData.stats.newCustomersCount }}</p>
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
                <p class="stat-value">{{ dashboardData.stats.totalStock.toLocaleString() }}</p>
                <p class="stat-change warning">{{ dashboardData.stats.lowStockCount }} รายการใกล้หมด</p>
              </div>
              <div class="stat-icon orange">
                <span>📊</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div v-if="!loading" class="charts-grid">
          <div class="card chart-card">
            <h2 class="card-title">ยอดขาย 7 วันล่าสุด</h2>
            <div class="chart-container">
              <canvas ref="salesChart"></canvas>
            </div>
          </div>

          <div class="card chart-card">
            <h2 class="card-title">สินค้าขายดี Top 5</h2>
            <div class="chart-container">
              <canvas ref="topProductsChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div v-if="!loading" class="card orders-card">
          <h2 class="card-title">คำสั่งซื้อล่าสุด</h2>
          <div v-if="dashboardData.recentOrders.length === 0" class="empty-state">
            <p>ยังไม่มีคำสั่งซื้อ</p>
          </div>
          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>รหัสคำสั่งซื้อ</th>
                  <th>ลูกค้า</th>
                  <th class="hide-mobile">ยอดรวม</th>
                  <th>สถานะ</th>
                  <th class="hide-mobile">วันที่</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in dashboardData.recentOrders" :key="order.id">
                  <td class="font-semibold">
                    <div class="order-number">{{ order.order_number }}</div>
                    <div class="mobile-only mobile-date">{{ formatDate(order.created_at) }}</div>
                  </td>
                  <td>
                    <div>{{ order.customer_name }}</div>
                    <div class="mobile-only mobile-price">฿{{ parseFloat(order.total).toLocaleString() }}</div>
                  </td>
                  <td class="font-semibold hide-mobile">฿{{ parseFloat(order.total).toLocaleString() }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="text-muted hide-mobile">{{ formatDate(order.created_at) }}</td>
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
import Chart from 'chart.js/auto'

const { user, signOut } = useAuth()
const { getAllDashboardData } = useDashboard()

const currentPage = ref('หน้าแรก')
const isSidebarCollapsed = ref(false)
const showMobileSidebar = ref(false)
const loading = ref(true)

// ข้อมูล Dashboard
const dashboardData = ref({
  recentOrders: [] as any[],
  stats: {
    totalSales: 0,
    newOrdersCount: 0,
    newCustomersCount: 0,
    totalStock: 0,
    lowStockCount: 0
  },
  chartData: {
    dates: [] as string[],
    sales: [] as number[]
  },
  topProducts: {
    names: [] as string[],
    sales: [] as number[]
  }
})

const salesChart = ref<HTMLCanvasElement | null>(null)
const topProductsChart = ref<HTMLCanvasElement | null>(null)

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

// Mobile Sidebar Controls
const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'pending': 'รอชำระ',
    'processing': 'กำลังดำเนินการ',
    'shipping': 'กำลังจัดส่ง',
    'completed': 'สำเร็จ',
    'cancelled': 'ยกเลิก'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'completed': 'success',
    'shipping': 'info',
    'processing': 'info',
    'pending': 'warning',
    'cancelled': 'default'
  }
  return classes[status] || 'default'
}

// สร้างกราฟ
const renderCharts = () => {
  if (salesChart.value && dashboardData.value.chartData.dates.length > 0) {
    const ctx = salesChart.value.getContext('2d')
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 300)
      gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)')
      gradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)')
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: dashboardData.value.chartData.dates,
          datasets: [{
            label: 'ยอดขาย (฿)',
            data: dashboardData.value.chartData.sales,
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: gradient,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: 'rgb(99, 102, 241)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: (context) => '฿' + context.parsed.y.toLocaleString()
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: {
                callback: function(value: any) {
                  return '฿' + value.toLocaleString()
                }
              }
            },
            x: { grid: { display: false } }
          }
        }
      })
    }
  }

  if (topProductsChart.value && dashboardData.value.topProducts.names.length > 0) {
    const ctx2 = topProductsChart.value.getContext('2d')
    if (ctx2) {
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: dashboardData.value.topProducts.names,
          datasets: [{
            label: 'ยอดขาย (฿)',
            data: dashboardData.value.topProducts.sales,
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(236, 72, 153, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(34, 197, 94, 0.8)',
            ],
            borderRadius: 8,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                label: (context) => '฿' + context.parsed.y.toLocaleString()
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.05)' },
              ticks: {
                callback: function(value: any) {
                  return '฿' + value.toLocaleString()
                }
              }
            },
            x: { grid: { display: false } }
          }
        }
      })
    }
  }
}

const loadDashboardData = async () => {
  loading.value = true
  
  try {
    const { data, error } = await getAllDashboardData()

    if (error) {
      console.error('Error loading dashboard:', error)
      return
    }

    if (data) {
      dashboardData.value = data
    }

    await nextTick()
    renderCharts()

  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
}

const handleMenuClick = (item: any) => {
  console.log('Menu clicked:', item) // Debug log
  
  currentPage.value = item.label
  closeMobileSidebar()
  
  // Navigate to pages
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

const handleLogout = async () => {
  await signOut()
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
/* Base Styles */
.dashboard-container {
  min-height: 100vh;
  background: #f9fafb;
  position: relative;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  width: 48px;
  height: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: #f9fafb;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

.hamburger-line {
  width: 24px;
  height: 2.5px;
  background: #1e293b;
  border-radius: 2px;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.main-content {
  margin-left: 300px;
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

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-text {
  flex: 1;
  min-width: 200px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-icon {
  font-size: 1.1rem;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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
  flex-shrink: 0;
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

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.25rem;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Table */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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
  white-space: nowrap;
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

.badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
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

.badge.default {
  background: #f3f4f6;
  color: #6b7280;
}

/* Mobile-specific elements */
.mobile-only {
  display: none;
}

.mobile-date,
.mobile-price {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Responsive Breakpoints */

/* Tablet (768px - 1024px) */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* Mobile Large (481px - 768px) */
@media (max-width: 768px) {
  /* แสดงปุ่ม Mobile Menu */
  .mobile-menu-btn {
    display: flex !important;
  }
  
  /* ลบ margin ของ main content */
  .main-content {
    margin-left: 0 !important;
  }
  
  .main-content.sidebar-collapsed {
    margin-left: 0 !important;
  }
  
  .content-wrapper {
    padding: 1rem;
    padding-top: 5rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.875rem;
  }
  
  .logout-btn {
    width: 100%;
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon {
    width: 3rem;
    height: 3rem;
    font-size: 1.5rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .card {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.125rem;
  }
  
  /* Table responsive */
  .hide-mobile {
    display: none;
  }
  
  .mobile-only {
    display: block;
  }
  
  .data-table {
    min-width: 100%;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.875rem;
  }
  
  .order-number {
    font-weight: 600;
  }
}

/* Mobile Small (max 480px) */
@media (max-width: 480px) {
  .content-wrapper {
    padding: 0.75rem;
    padding-top: 4.5rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.375rem;
  }
  
  .stat-label,
  .stat-change {
    font-size: 0.8rem;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .logout-text {
    display: none;
  }
  
  .logout-btn {
    padding: 0.625rem 1rem;
    width: auto;
  }
  
  .badge {
    padding: 0.25rem 0.625rem;
    font-size: 0.7rem;
  }
}

/* Landscape Mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .chart-container {
    height: 200px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>