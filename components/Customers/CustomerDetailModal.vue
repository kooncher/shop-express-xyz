<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">รายละเอียดลูกค้า</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="modal-body">
        <!-- Customer Info -->
        <div class="section">
          <div class="customer-header">
            <div>
              <h3 class="customer-name">{{ customerData.name }}</h3>
              <span :class="['badge', 'badge-lg', customerData.status === 'active' ? 'success' : 'secondary']">
                {{ customerData.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
              </span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">อีเมล:</span>
              <span class="info-value">{{ customerData.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">เบอร์โทร:</span>
              <span class="info-value">{{ customerData.phone || '-' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">ที่อยู่:</span>
              <span class="info-value">{{ customerData.address || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="section">
          <h3 class="section-title">สถิติการซื้อ</h3>
          <div class="stats-row">
            <div class="stat-box">
              <span class="stat-icon">📦</span>
              <div>
                <p class="stat-label">คำสั่งซื้อ</p>
                <p class="stat-value">{{ customerData.total_orders || 0 }}</p>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-icon">💰</span>
              <div>
                <p class="stat-label">ยอดซื้อรวม</p>
                <p class="stat-value">฿{{ formatNumber(customerData.total_spent || 0) }}</p>
              </div>
            </div>
            <div class="stat-box">
              <span class="stat-icon">📅</span>
              <div>
                <p class="stat-label">ซื้อล่าสุด</p>
                <p class="stat-value-small">{{ customerData.last_order_date ? formatDate(customerData.last_order_date) : '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order History -->
        <div class="section">
          <h3 class="section-title">ประวัติคำสั่งซื้อ</h3>
          
          <div v-if="loadingOrders" class="loading-state-small">
            <div class="spinner-small"></div>
            <p>กำลังโหลด...</p>
          </div>

          <div v-else-if="!customerData.orders || customerData.orders.length === 0" class="empty-state-small">
            <p>ยังไม่มีประวัติคำสั่งซื้อ</p>
          </div>

          <div v-else class="orders-list">
            <div v-for="order in customerData.orders" :key="order.id" class="order-item">
              <div class="order-info">
                <p class="order-number">{{ order.order_number }}</p>
                <p class="order-date">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="order-details">
                <span :class="['badge', getStatusClass(order.status)]">
                  {{ getStatusLabel(order.status) }}
                </span>
                <p class="order-total">฿{{ formatNumber(order.total) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-close">
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  customer: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  refresh: []
}>()

const { getCustomer } = useCustomers()

const customerData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
  total_orders: 0,
  total_spent: 0,
  last_order_date: null,
  orders: []
})

const loadingOrders = ref(true)

// Load customer details
const loadCustomerDetails = async () => {
  loadingOrders.value = true
  
  if (props.customer.id) {
    const { data } = await getCustomer(props.customer.id)
    if (data) {
      customerData.value = data
    }
  } else {
    customerData.value = { ...props.customer }
  }
  
  loadingOrders.value = false
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

// Format number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
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

onMounted(() => {
  loadCustomerDetails()
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
}

.section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
}

.customer-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.customer-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-lg {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.secondary {
  background: #f3f4f6;
  color: #374151;
}

.badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.primary {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.info-value {
  font-size: 0.95rem;
  color: #111827;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 2rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.stat-value-small {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.loading-state-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: #6b7280;
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state-small {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.order-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.order-info {
  flex: 1;
}

.order-number {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.order-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.order-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-total {
  font-weight: 700;
  color: #111827;
  min-width: 100px;
  text-align: right;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.btn-close {
  padding: 0.75rem 1.5rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-close:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .order-details {
    width: 100%;
    justify-content: space-between;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>