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
            <h1 class="page-title">จัดการคำสั่งซื้อ</h1>
            <p class="page-subtitle">จัดการคำสั่งซื้อทั้งหมดในระบบ</p>
          </div>
          
          <button @click="openCreateModal" class="btn-primary">
            <span>➕</span>
            <span>สร้างคำสั่งซื้อ</span>
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">คำสั่งซื้อทั้งหมด</p>
              <p class="stat-value">{{ orders.length }}</p>
            </div>
            <div class="stat-icon">📦</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">รอดำเนินการ</p>
              <p class="stat-value">{{ getOrdersByStatus('pending').length }}</p>
            </div>
            <div class="stat-icon pending">⏳</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">กำลังจัดส่ง</p>
              <p class="stat-value">{{ getOrdersByStatus('shipping').length }}</p>
            </div>
            <div class="stat-icon shipping">🚚</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">สำเร็จแล้ว</p>
              <p class="stat-value">{{ getOrdersByStatus('completed').length }}</p>
            </div>
            <div class="stat-icon completed">✅</div>
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
                placeholder="ค้นหาเลขที่คำสั่งซื้อ หรือชื่อลูกค้า..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <select v-model="filterStatus" @change="loadOrders" class="filter-select">
              <option value="">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="processing">กำลังเตรียมสินค้า</option>
              <option value="shipping">กำลังจัดส่ง</option>
              <option value="completed">สำเร็จแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>

            <select v-model="filterPaymentStatus" @change="loadOrders" class="filter-select">
              <option value="">ทุกสถานะการชำระ</option>
              <option value="unpaid">ยังไม่ชำระ</option>
              <option value="paid">ชำระแล้ว</option>
              <option value="refunded">คืนเงินแล้ว</option>
            </select>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="card">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>

          <div v-else-if="orders.length === 0" class="empty-state">
            <span class="empty-icon">📋</span>
            <h3>ยังไม่มีคำสั่งซื้อในระบบ</h3>
            <p>เริ่มต้นสร้างคำสั่งซื้อแรกของคุณเลย!</p>
            <button @click="openCreateModal" class="btn-primary">
              สร้างคำสั่งซื้อแรก
            </button>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>ลูกค้า</th>
                  <th>เบอร์โทร</th>
                  <th>ยอดรวม</th>
                  <th>สถานะ</th>
                  <th>การชำระเงิน</th>
                  <th>วันที่สั่ง</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in orders" :key="order.id">
                  <td class="font-semibold">{{ order.order_number }}</td>
                  <td>{{ order.customer_name }}</td>
                  <td class="text-muted">{{ order.customer_phone || '-' }}</td>
                  <td class="font-semibold">฿{{ formatNumber(order.total) }}</td>
                  <td>
                    <span :class="['badge', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', getPaymentStatusClass(order.payment_status)]">
                      {{ getPaymentStatusLabel(order.payment_status) }}
                    </span>
                  </td>
                  <td class="text-muted">{{ formatDate(order.created_at) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="viewOrder(order)" class="btn-icon btn-view" title="ดูรายละเอียด">
                        👁️
                      </button>
                      <button @click="openEditModal(order)" class="btn-icon btn-edit" title="แก้ไข">
                        ✏️
                      </button>
                      <button @click="confirmDelete(order)" class="btn-icon btn-delete" title="ลบ">
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

    <!-- Create/Edit Order Modal -->
    <OrderModal
      v-if="showModal"
      :order="selectedOrder"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- View Order Detail Modal -->
    <OrderDetailModal
      v-if="showDetailModal"
      :order="selectedOrder"
      @close="closeDetailModal"
      @update-status="handleUpdateStatus"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteConfirm"
      title="ยืนยันการลบคำสั่งซื้อ"
      :message="`คุณต้องการลบคำสั่งซื้อ &quot;${orderToDelete?.order_number}&quot; ใช่หรือไม่?`"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import OrderModal from '~/components/orders/OrderModal.vue'
import OrderDetailModal from '~/components/orders/OrderDetailModal.vue'
import ConfirmModal from '~/components/orders/ConfirmModal.vue'


definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const { getOrders, deleteOrder } = useOrders()

const isSidebarCollapsed = ref(false)
const loading = ref(true)
const orders = ref([])
const searchQuery = ref('')
const filterStatus = ref('')
const filterPaymentStatus = ref('')

// Modal states - ส่วนที่หายไป
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedOrder = ref(null)
const showDeleteConfirm = ref(false)
const orderToDelete = ref(null)

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

// Load orders
const loadOrders = async () => {
  loading.value = true
  const filters: any = {}
  
  if (filterStatus.value) {
    filters.status = filterStatus.value
  }
  
  if (filterPaymentStatus.value) {
    filters.payment_status = filterPaymentStatus.value
  }
  
  if (searchQuery.value) {
    filters.search = searchQuery.value
  }

  const { data, error } = await getOrders(filters)
  
  if (!error && data) {
    orders.value = data
  }
  
  loading.value = false
}

// Search handler with debounce - ส่วนที่หายไป
let searchTimeout: any
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadOrders()
  }, 500)
}

// Get orders by status
const getOrdersByStatus = (status: string) => {
  return orders.value.filter((order: any) => order.status === status)
}

// Modal handlers - ส่วนที่หายไป
const openCreateModal = () => {
  selectedOrder.value = null
  showModal.value = true
}

const openEditModal = (order: any) => {
  selectedOrder.value = { ...order }
  showModal.value = true
}

const viewOrder = (order: any) => {
  selectedOrder.value = order
  showDetailModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedOrder.value = null
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedOrder.value = null
}

const handleSave = async () => {
  closeModal()
  await loadOrders()
}

const handleUpdateStatus = async () => {
  await loadOrders()
}

const confirmDelete = (order: any) => {
  orderToDelete.value = order
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (orderToDelete.value) {
    const { error } = await deleteOrder(orderToDelete.value.id)
    
    if (!error) {
      await loadOrders()
    }
  }
  
  showDeleteConfirm.value = false
  orderToDelete.value = null
}

// Get status class
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

// Get status label
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

// Get payment status class
const getPaymentStatusClass = (status: string) => {
  const classes: any = {
    unpaid: 'warning',
    paid: 'success',
    refunded: 'danger'
  }
  return classes[status] || 'secondary'
}

// Get payment status label
const getPaymentStatusLabel = (status: string) => {
  const labels: any = {
    unpaid: 'ยังไม่ชำระ',
    paid: 'ชำระแล้ว',
    refunded: 'คืนเงินแล้ว'
  }
  return labels[status] || status
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Handle menu click
const handleMenuClick = (item: any) => {
  if (item.id === 'home') {
    navigateTo('/dashboard')
  } else if (item.id === 'products') {
    navigateTo('/products')
  } else if (item.id === 'orders') {
    navigateTo('/orders')
  }else if (item.id === 'customers') {
    navigateTo('/customers')
  }else if (item.id === 'reports') {
     navigateTo('/reports')
  }
  else if (item.id === 'settings') {
    navigateTo('/settings')
  }
}

const handleToggle = (isCollapsed: boolean) => {
  isSidebarCollapsed.value = isCollapsed
}

// Initialize
onMounted(async () => {
  await loadOrders()
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
  justify-content: center; /* เพิ่มบรรทัดนี้ */
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  width: 100%; /* เพิ่มบรรทัดนี้ */
}

/* ส่วน CSS ที่เหลือเหมือนเดิม */
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

.stat-icon.pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-icon.shipping {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-icon.completed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
}
</style>