<template>
  <div class="dashboard-container">


    <button class="floating-hamburger-btn" @click="toggleMobileSidebar">
      <div class="hamburger-icon-wrapper">
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
      </div>
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
          <div>
            <h1 class="page-title">จัดการลูกค้า</h1>
            <p class="page-subtitle">จัดการข้อมูลลูกค้าทั้งหมดในระบบ</p>
          </div>
          
          <button @click="openCreateModal" class="btn-primary">
            <span>➕</span>
            <span>เพิ่มลูกค้า</span>
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">ลูกค้าทั้งหมด</p>
              <p class="stat-value">{{ stats.total }}</p>
            </div>
            <div class="stat-icon">👥</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">ลูกค้าที่ใช้งาน</p>
              <p class="stat-value">{{ stats.active }}</p>
            </div>
            <div class="stat-icon active">✅</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">ลูกค้าที่สั่งซื้อแล้ว</p>
              <p class="stat-value">{{ stats.withOrders }}</p>
            </div>
            <div class="stat-icon orders">🛒</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">รายได้รวม</p>
              <p class="stat-value">฿{{ formatNumber(stats.totalRevenue) }}</p>
            </div>
            <div class="stat-icon revenue">💰</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="card">
          <div class="filters">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ค้นหาชื่อ อีเมล หรือเบอร์โทร..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <select v-model="filterStatus" @change="loadCustomers" class="filter-select">
              <option value="">ทุกสถานะ</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ไม่ใช้งาน</option>
            </select>
          </div>
        </div>

        <!-- Customers Table -->
        <div class="card">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>

          <div v-else-if="customers.length === 0" class="empty-state">
            <span class="empty-icon">👥</span>
            <h3>ยังไม่มีลูกค้าในระบบ</h3>
            <p>เริ่มต้นเพิ่มลูกค้าแรกของคุณเลย!</p>
            <button @click="openCreateModal" class="btn-primary">
              เพิ่มลูกค้าแรก
            </button>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ชื่อ-นามสกุล</th>
                  <th>อีเมล</th>
                  <th>เบอร์โทร</th>
                  <th>คำสั่งซื้อ</th>
                  <th>ยอดซื้อรวม</th>
                  <th>ซื้อล่าสุด</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="customer in customers" :key="customer.id">
                  <td class="font-semibold">{{ customer.name }}</td>
                  <td class="text-muted">{{ customer.email || '-' }}</td>
                  <td class="text-muted">{{ customer.phone || '-' }}</td>
                  <td class="text-center">{{ customer.total_orders || 0 }}</td>
                  <td class="font-semibold">฿{{ formatNumber(customer.total_spent || 0) }}</td>
                  <td class="text-muted">{{ customer.last_order_date ? formatDate(customer.last_order_date) : '-' }}</td>
                  <td>
                    <span :class="['badge', customer.status === 'active' ? 'success' : 'secondary']">
                      {{ customer.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="viewCustomer(customer)" class="btn-icon btn-view" title="ดูรายละเอียด">
                        👁️
                      </button>
                      <button @click="openEditModal(customer)" class="btn-icon btn-edit" title="แก้ไข">
                        ✏️
                      </button>
                      <button @click="confirmDelete(customer)" class="btn-icon btn-delete" title="ลบ">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Customer Modal -->
    <CustomerModal
      v-if="showModal"
      :customer="selectedCustomer"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- View Customer Detail Modal -->
    <CustomerDetailModal
      v-if="showDetailModal"
      :customer="selectedCustomer"
      @close="closeDetailModal"
      @refresh="loadCustomers"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="ยืนยันการลบลูกค้า"
      :message="`คุณต้องการลบลูกค้า &quot;${customerToDelete?.name}&quot; ใช่หรือไม่?`"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import CustomerModal from '~/components/Customers/CustomerModal.vue'
import CustomerDetailModal from '~/components/Customers/CustomerDetailModal.vue'
import ConfirmModal from '~/components/Orders/ConfirmModal.vue'
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const { getCustomers, deleteCustomer, getCustomerStats } = useCustomers()
const showMobileSidebar = ref(false)

const isSidebarCollapsed = ref(false)
const loading = ref(true)
const customers = ref([])
const searchQuery = ref('')
const filterStatus = ref('')

// Modal states
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedCustomer = ref(null)
const showDeleteConfirm = ref(false)
const customerToDelete = ref(null)

// Stats
const stats = ref({
  total: 0,
  active: 0,
  inactive: 0,
  withOrders: 0,
  totalRevenue: 0
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

// Load customers
// ค้นหาฟังก์ชัน loadCustomers ในหน้า .vue แล้วแทนที่ด้วยสิ่งนี้:
const loadCustomers = async () => {
  loading.value = true
  try {
    const filters: any = {}
    if (filterStatus.value) filters.status = filterStatus.value
    if (searchQuery.value) filters.search = searchQuery.value

    // ดึงข้อมูลจาก Composable
    const { data, error } = await getCustomers(filters)
    
    if (error) throw error

    // DEBUG: เปิด Console ใน Browser (F12) ดูว่าข้อมูลมาไหม
    console.log("รายชื่อลูกค้าจาก DB:", data)

    // บรรทัดสำคัญ: ต้องเอา data ไปใส่ใน customers.value
    customers.value = data || [] 
    
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการโหลดข้อมูล:', err)
    customers.value = []
  } finally {
    loading.value = false
  }
}
// Load stats
const loadStats = async () => {
  const { data } = await getCustomerStats()
  if (data) {
    stats.value = data
  }
}

// Search handler with debounce
let searchTimeout: any
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadCustomers()
  }, 500)
}

// Modal handlers
const openCreateModal = () => {
  selectedCustomer.value = null
  showModal.value = true
}

const openEditModal = (customer: any) => {
  selectedCustomer.value = { ...customer }
  showModal.value = true
}

const viewCustomer = (customer: any) => {
  selectedCustomer.value = customer
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedCustomer.value = null
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedCustomer.value = null
}

const handleSave = async () => {
  closeModal()
  await loadCustomers()
  await loadStats()
}

const confirmDelete = (customer: any) => {
  customerToDelete.value = customer
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (customerToDelete.value) {
    const { error } = await deleteCustomer(customerToDelete.value.id)
    
    if (!error) {
      await loadCustomers()
      await loadStats()
    }
  }
  
  showDeleteConfirm.value = false
  customerToDelete.value = null
}

// Format number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
// Mobile Sidebar Controls
const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const handleToggle = (isCollapsed) => {
  isSidebarCollapsed.value = isCollapsed
}
// Handle menu click
const handleMenuClick = (item: any) => {
  if (item.id === 'home') {
    navigateTo('/dashboard')
  } else if (item.id === 'products') {
    navigateTo('/products')
  } else if (item.id === 'orders') {
    navigateTo('/orders')
  } else if (item.id === 'customers') {
    navigateTo('/customers')
  }else if (item.id === 'reports') {
     navigateTo('/reports')
  } else if (item.id === 'settings') {
    navigateTo('/settings')
  }
}
// Initialize
onMounted(async () => {
  await Promise.all([
    loadCustomers(),
    loadStats()
  ])
})
</script>

<style scoped>
/* CSS เหมือนกับหน้า Orders */
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-icon.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
}

.stat-icon.orders {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 1rem;
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

.badge.secondary {
  background: #f3f4f6;
  color: #374151;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-view {
  background: #e0e7ff;
}

.btn-view:hover {
  background: #c7d2fe;
  transform: scale(1.1);
}

.btn-edit {
  background: #dbeafe;
}

.btn-edit:hover {
  background: #bfdbfe;
  transform: scale(1.1);
}

.btn-delete {
  background: #fee2e2;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }

  /* --- ส่วน Stats Grid: ปรับให้เรียง 2 คอลัมน์แบบในรูป --- */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important; /* บังคับแถวละ 2 กล่อง */
    gap: 10px !important; /* ระยะห่างพอดีๆ ไม่กว้างเกินไป */
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem !important; /* ลด padding ให้กระชับ */
    flex-direction: row !important; /* จัด icon กับตัวเลขไว้คนละฝั่ง */
    justify-content: space-between;
    height: auto;
    min-height: 90px;
    margin-bottom: 0 !important; /* ให้ grid จัดการ margin เอง */
  }

  .stat-value {
    font-size: 1.25rem !important; /* ลดขนาดตัวเลขไม่ให้เบียดกัน */
    margin-top: 4px;
  }

  .stat-label {
    font-size: 0.8rem !important; /* ชื่อหัวข้อเล็กลงนิดนึง */
  }

  .stat-icon {
    width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: 1.2rem !important;
    min-width: 2.5rem;
  }

  /* --- ส่วน Filters & Search: ปรับให้เต็มความกว้างและกดง่าย --- */
  .filters {
    flex-direction: column !important; /* ค้นหาอยู่บน Dropdown อยู่ล่าง */
    gap: 12px !important;
  }

  .search-box {
    width: 100% !important;
  }

  .filter-select {
    width: 100% !important; /* ตัวเลือกสถานะกว้างเต็มจอ */
  }

  /* --- ส่วน Main Content --- */
  .main-content {
    margin-left: 0 !important;
  }
}

/* --- Floating Hamburger Button (ม่วง Indigo เหมือนในรูป) --- */
.floating-hamburger-btn {
  display: none; /* เริ่มต้นซ่อนไว้ก่อน */
  position: fixed;
  bottom: 25px; /* ระยะจากขอบล่าง */
  right: 25px;  /* ระยะจากขอบขวา */
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 50%;
  border: none;
  z-index: 2001; /* ให้อยู่เหนือทุกอย่าง */
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-hamburger-btn:active {
  transform: scale(0.9);
}

/* เส้น Hamburger */
.hamburger-icon-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hamburger-icon-wrapper span {
  display: block;
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: 0.3s ease;
}

/* Animation เส้นเมื่อเปิดเมนู */
.line-open:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.line-open:nth-child(2) { opacity: 0; }
.line-open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* --- Media Query: แสดงเฉพาะบนมือถือ --- */
@media (max-width: 1024px) {
  .floating-hamburger-btn {
    display: flex; /* แสดงปุ่มเฉพาะหน้าจอเล็ก */
  }

  /* แก้ไขส่วนที่เละ: เคลียร์ Margin ของหน้าหลักออก */
  .main-content {
    margin-left: 0 !important;
    padding: 15px !important;
    padding-top: 20px !important; /* เว้นที่ให้ Header */
  }

  /* ป้องกันตารางล้น (เละแบบในรูป image_f3be03) */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>