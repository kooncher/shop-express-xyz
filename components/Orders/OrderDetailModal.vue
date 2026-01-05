<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">รายละเอียดคำสั่งซื้อ</h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <div class="modal-body" ref="printArea">
        <!-- Order Info -->
        <div class="section">
          <div class="order-header">
            <div>
              <h3 class="order-number">{{ orderData.order_number }}</h3>
              <p class="order-date">{{ formatDate(orderData.created_at) }}</p>
            </div>
            <div class="status-badges">
              <span :class="['badge', 'badge-lg', getStatusClass(orderData.status)]">
                {{ getStatusLabel(orderData.status) }}
              </span>
              <span :class="['badge', 'badge-lg', getPaymentStatusClass(orderData.payment_status)]">
                {{ getPaymentStatusLabel(orderData.payment_status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="section">
          <h3 class="section-title">ข้อมูลลูกค้า</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">ชื่อลูกค้า:</span>
              <span class="info-value">{{ orderData.customer_name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">เบอร์โทร:</span>
              <span class="info-value">{{ orderData.customer_phone || '-' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="info-label">ที่อยู่จัดส่ง:</span>
              <span class="info-value">{{ orderData.customer_address || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">วิธีชำระเงิน:</span>
              <span class="info-value">{{ orderData.payment_method || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="section">
          <h3 class="section-title">รายการสินค้า</h3>
          <div class="items-table">
            <table>
              <thead>
                <tr>
                  <th>สินค้า</th>
                  <th>SKU</th>
                  <th class="text-right">ราคา</th>
                  <th class="text-center">จำนวน</th>
                  <th class="text-right">รวม</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderData.items" :key="item.id">
                  <td>{{ item.product_name }}</td>
                  <td class="text-muted">{{ item.product_sku || '-' }}</td>
                  <td class="text-right">฿{{ formatNumber(item.price) }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-right font-semibold">฿{{ formatNumber(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="section">
          <div class="summary-box">
            <div class="summary-row">
              <span class="summary-label">ยอดรวมสินค้า:</span>
              <span class="summary-value">฿{{ formatNumber(orderData.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">ส่วนลด:</span>
              <span class="summary-value text-red">-฿{{ formatNumber(orderData.discount) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">ค่าจัดส่ง:</span>
              <span class="summary-value">฿{{ formatNumber(orderData.shipping_fee) }}</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">ยอดรวมสุทธิ:</span>
              <span class="summary-value total-value">฿{{ formatNumber(orderData.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="orderData.notes" class="section">
          <h3 class="section-title">หมายเหตุ</h3>
          <div class="notes-box">
            {{ orderData.notes }}
          </div>
        </div>

        <!-- Update Status (hidden when printing) -->
        <div class="section no-print">
          <h3 class="section-title">อัพเดทสถานะ</h3>
          <div class="status-update-grid">
            <div class="form-group">
              <label class="form-label">สถานะคำสั่งซื้อ</label>
              <select v-model="newStatus" class="form-select">
                <option value="pending">รอดำเนินการ</option>
                <option value="confirmed">ยืนยันแล้ว</option>
                <option value="processing">กำลังเตรียมสินค้า</option>
                <option value="shipping">กำลังจัดส่ง</option>
                <option value="completed">สำเร็จแล้ว</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">สถานะการชำระเงิน</label>
              <select v-model="newPaymentStatus" class="form-select">
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="paid">ชำระแล้ว</option>
                <option value="refunded">คืนเงินแล้ว</option>
              </select>
            </div>

            <div class="form-group full-width">
              <button
                @click="updateStatus"
                :disabled="!hasStatusChanged"
                class="btn-update"
              >
                {{ updating ? 'กำลังอัพเดท...' : 'อัพเดทสถานะ' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer no-print">
        <InvoiceButton :order="orderData" />
   
        <div style="flex: 1"></div>
        <button @click="$emit('close')" class="btn-close">
          ปิด
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InvoiceButton from './OrderComponents/OrderInvoice.vue'

interface Props {
  order: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  'update-status': []
}>()

const { getOrder, updateOrderStatus, updatePaymentStatus } = useOrders()

const orderData = ref({
  order_number: '',
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  payment_method: '',
  status: 'pending',
  payment_status: 'unpaid',
  subtotal: 0,
  discount: 0,
  shipping_fee: 0,
  total: 0,
  notes: '',
  items: [],
  created_at: new Date().toISOString()
})

const newStatus = ref('')
const newPaymentStatus = ref('')
const updating = ref(false)
const printArea = ref(null)

// Load order details
const loadOrderDetails = async () => {
  if (props.order.id) {
    const { data } = await getOrder(props.order.id)
    if (data) {
      orderData.value = data
      newStatus.value = data.status
      newPaymentStatus.value = data.payment_status
    }
  } else {
    orderData.value = { ...props.order }
    newStatus.value = props.order.status
    newPaymentStatus.value = props.order.payment_status
  }
}

// Check if status has changed
const hasStatusChanged = computed(() => {
  return (
    newStatus.value !== orderData.value.status ||
    newPaymentStatus.value !== orderData.value.payment_status
  )
})

// Update status
const updateStatus = async () => {
  try {
    updating.value = true

    if (newStatus.value !== orderData.value.status) {
      await updateOrderStatus(props.order.id, newStatus.value)
    }

    if (newPaymentStatus.value !== orderData.value.payment_status) {
      await updatePaymentStatus(props.order.id, newPaymentStatus.value)
    }

    orderData.value.status = newStatus.value
    orderData.value.payment_status = newPaymentStatus.value

    emit('update-status')
  } catch (error) {
    console.error('Update status error:', error)
  } finally {
    updating.value = false
  }
}

// Print order
const printOrder = () => {
  window.print()
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
  }).format(num || 0)
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadOrderDetails()
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
  max-width: 800px;
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

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
}

.order-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.order-date {
  color: #6b7280;
  font-size: 0.875rem;
}

.status-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.items-table {
  overflow-x: auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.items-table table {
  width: 100%;
  border-collapse: collapse;
}

.items-table thead {
  background: #f9fafb;
}

.items-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.items-table td {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  color: #111827;
  border-bottom: 1px solid #f3f4f6;
}

.items-table tbody tr:last-child td {
  border-bottom: none;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #6b7280;
}

.font-semibold {
  font-weight: 600;
}

.summary-box {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.summary-row:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.summary-label {
  font-size: 0.95rem;
  color: #6b7280;
}

.summary-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.text-red {
  color: #dc2626;
}

.total-row {
  margin-top: 0.5rem;
  padding-top: 1rem;
  border-top: 2px solid #111827;
}

.total-row .summary-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.total-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

.notes-box {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  color: #374151;
  line-height: 1.6;
}

.status-update-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-select {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-update {
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

.btn-update:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-update:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn-print {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-print:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
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

/* Print Styles */
@media print {
  /* ซ่อนทุกอย่างในหน้า */
  body * {
    visibility: hidden !important;
  }

  /* แสดงเฉพาะ modal และเนื้อหาข้างใน */
  .modal-overlay,
  .modal-overlay *,
  .modal-container,
  .modal-container * {
    visibility: visible !important;
  }

  .modal-overlay {
    position: static !important;
    background: none !important;
    padding: 0 !important;
    display: block !important;
  }

  .modal-container {
    max-width: 100% !important;
    max-height: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    position: static !important;
    width: 100% !important;
    overflow: visible !important;
  }

  /* ซ่อนส่วนที่ไม่ต้องการพิมพ์ */
  .modal-header,
  .modal-footer,
  .no-print,
  .close-btn {
    display: none !important;
    visibility: hidden !important;
  }

  .modal-body {
    padding: 0 !important;
  }

  /* จัดรูปแบบหน้ากระดาษ */
  @page {
    margin: 1.5cm;
    size: A4;
  }

  /* เพิ่มหัวกระดาษ */
  .order-header {
    margin-bottom: 1.5rem !important;
  }

  .order-number {
    font-size: 1.75rem !important;
  }

  .section {
    page-break-inside: avoid;
    margin-bottom: 1rem !important;
    padding-bottom: 1rem !important;
    border-bottom: 1px solid #e5e7eb !important;
  }

  .section:last-of-type {
    border-bottom: none !important;
  }

  .items-table {
    border: 1px solid #e5e7eb !important;
    page-break-inside: avoid;
  }

  .items-table table {
    page-break-inside: avoid;
  }

  /* รักษาสีของ badge */
  .badge {
    border: 1px solid currentColor !important;
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* ป้องกันการตัดข้อมูลที่สำคัญ */
  .info-grid,
  .summary-box,
  .notes-box {
    page-break-inside: avoid;
  }
}

@media (max-width: 768px) {
  .info-grid,
  .status-update-grid {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn-print,
  .btn-close {
    width: 100%;
  }
}
</style>