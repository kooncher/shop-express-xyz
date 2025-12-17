<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ order ? 'แก้ไขคำสั่งซื้อ' : 'สร้างคำสั่งซื้อใหม่' }}
        </h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Customer Information -->
        <div class="section">
          <h3 class="section-title">ข้อมูลลูกค้า</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label required">ชื่อลูกค้า</label>
              <input
                v-model="formData.customer_name"
                type="text"
                class="form-input"
                placeholder="ชื่อ-นามสกุล"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">เบอร์โทร</label>
              <input
                v-model="formData.customer_phone"
                type="tel"
                class="form-input"
                placeholder="081-234-5678"
              />
            </div>

            <div class="form-group">
              <label class="form-label">วิธีชำระเงิน</label>
              <select v-model="formData.payment_method" class="form-select">
                <option value="">เลือกวิธีชำระเงิน</option>
                <option value="โอนเงิน">โอนเงิน</option>
                <option value="เก็บเงินปลายทาง">เก็บเงินปลายทาง</option>
                <option value="บัตรเครดิต">บัตรเครดิต</option>
                <option value="พร้อมเพย์">พร้อมเพย์</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label class="form-label">ที่อยู่จัดส่ง</label>
              <textarea
                v-model="formData.customer_address"
                class="form-textarea"
                rows="3"
                placeholder="ที่อยู่สำหรับจัดส่งสินค้า"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="section">
          <div class="section-header">
            <h3 class="section-title">รายการสินค้า</h3>
            <button type="button" @click="addItem" class="btn-add-item">
              ➕ เพิ่มสินค้า
            </button>
          </div>

          <div v-if="formData.items.length === 0" class="empty-items">
            <p>ยังไม่มีรายการสินค้า กดปุ่ม "เพิ่มสินค้า" เพื่อเพิ่มรายการ</p>
          </div>

          <div v-else class="items-list">
            <div v-for="(item, index) in formData.items" :key="index" class="item-row">
              <div class="item-select">
                <select
                  v-model="item.product_id"
                  @change="onProductSelect(index)"
                  class="form-select"
                  required
                >
                  <option value="">เลือกสินค้า</option>
                  <option
                    v-for="product in products"
                    :key="product.id"
                    :value="product.id"
                  >
                    {{ product.name }} (฿{{ product.price }})
                  </option>
                </select>
              </div>

              <div class="item-quantity">
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="form-input"
                  placeholder="จำนวน"
                  @input="calculateItemTotal(index)"
                  required
                />
              </div>

              <div class="item-price">
                <input
                  v-model.number="item.price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input"
                  placeholder="ราคา"
                  @input="calculateItemTotal(index)"
                  required
                />
              </div>

              <div class="item-total">
                <span class="total-label">฿{{ formatNumber(item.quantity * item.price) }}</span>
              </div>

              <button type="button" @click="removeItem(index)" class="btn-remove-item">
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="section">
          <h3 class="section-title">สรุปคำสั่งซื้อ</h3>
          <div class="summary-grid">
            <div class="form-group">
              <label class="form-label">ยอดรวมสินค้า</label>
              <input
                :value="formatNumber(formData.subtotal)"
                type="text"
                class="form-input"
                readonly
              />
            </div>

            <div class="form-group">
              <label class="form-label">ส่วนลด</label>
              <input
                v-model.number="formData.discount"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                placeholder="0.00"
                @input="calculateTotal"
              />
            </div>

            <div class="form-group">
              <label class="form-label">ค่าจัดส่ง</label>
              <input
                v-model.number="formData.shipping_fee"
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                placeholder="0.00"
                @input="calculateTotal"
              />
            </div>

            <div class="form-group">
              <label class="form-label total-label-text">ยอดรวมสุทธิ</label>
              <input
                :value="formatNumber(formData.total)"
                type="text"
                class="form-input total-input"
                readonly
              />
            </div>
          </div>
        </div>

        <!-- Order Status -->
        <div class="section">
          <h3 class="section-title">สถานะ</h3>
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">สถานะคำสั่งซื้อ</label>
              <select v-model="formData.status" class="form-select">
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
              <select v-model="formData.payment_status" class="form-select">
                <option value="unpaid">ยังไม่ชำระ</option>
                <option value="paid">ชำระแล้ว</option>
                <option value="refunded">คืนเงินแล้ว</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label class="form-label">หมายเหตุ</label>
              <textarea
                v-model="formData.notes"
                class="form-textarea"
                rows="3"
                placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Actions -->
        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            ยกเลิก
          </button>
          <button type="submit" :disabled="loading" class="btn-submit">
            {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  order?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

// เปลี่ยนจาก useSupabaseClient เป็น useNuxtApp
const { createOrder, updateOrder } = useOrders()
const { getProducts } = useProducts()

const loading = ref(false)
const error = ref('')
const products = ref([])

const formData = ref({
  customer_name: '',
  customer_phone: '',
  customer_address: '',
  payment_method: '',
  items: [] as any[],
  subtotal: 0,
  discount: 0,
  shipping_fee: 0,
  total: 0,
  status: 'pending',
  payment_status: 'unpaid',
  notes: ''
})

// Load products
const loadProducts = async () => {
  const { data } = await getProducts()
  if (data) {
    products.value = data
  }
}

// Initialize form data
onMounted(async () => {
  await loadProducts()

  if (props.order) {
    formData.value = {
      customer_name: props.order.customer_name || '',
      customer_phone: props.order.customer_phone || '',
      customer_address: props.order.customer_address || '',
      payment_method: props.order.payment_method || '',
      items: props.order.items || [],
      subtotal: props.order.subtotal || 0,
      discount: props.order.discount || 0,
      shipping_fee: props.order.shipping_fee || 0,
      total: props.order.total || 0,
      status: props.order.status || 'pending',
      payment_status: props.order.payment_status || 'unpaid',
      notes: props.order.notes || ''
    }
  }
})

// Add item
const addItem = () => {
  formData.value.items.push({
    product_id: '',
    product_name: '',
    product_sku: '',
    quantity: 1,
    price: 0
  })
}

// Remove item
const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
  calculateSubtotal()
}

// On product select
const onProductSelect = (index: number) => {
  const item = formData.value.items[index]
  const product = products.value.find((p: any) => p.id === item.product_id)
  
  if (product) {
    item.product_name = product.name
    item.product_sku = product.sku
    item.price = product.price
    calculateItemTotal(index)
  }
}

// Calculate item total
const calculateItemTotal = (index: number) => {
  calculateSubtotal()
}

// Calculate subtotal
const calculateSubtotal = () => {
  formData.value.subtotal = formData.value.items.reduce(
    (sum, item) => sum + (item.quantity * item.price),
    0
  )
  calculateTotal()
}

// Calculate total
const calculateTotal = () => {
  formData.value.total =
    formData.value.subtotal -
    (formData.value.discount || 0) +
    (formData.value.shipping_fee || 0)
}

// Format number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

// Handle submit
const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (formData.value.items.length === 0) {
      error.value = 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ'
      return
    }

    if (props.order) {
      const { error: updateError } = await updateOrder(props.order.id, formData.value)
      if (updateError) throw updateError
    } else {
      const { error: createError } = await createOrder(formData.value)
      if (createError) throw createError
    }

    emit('save')
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
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
  max-width: 900px;
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.btn-add-item {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-item:hover {
  background: #2563eb;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-grid {
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

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.total-label-text {
  font-size: 1rem;
  color: #111827;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.total-input {
  font-weight: 700;
  font-size: 1.125rem;
  color: #059669;
}

.form-textarea {
  resize: vertical;
}

.empty-items {
  text-align: center;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  color: #6b7280;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.item-select,
.item-quantity,
.item-price {
  display: flex;
}

.item-total {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.total-label {
  font-weight: 600;
  color: #111827;
}

.btn-remove-item {
  width: 36px;
  height: 36px;
  border: none;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-item:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 0.95rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .item-row {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>