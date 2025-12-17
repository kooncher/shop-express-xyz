<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ customer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่' }}
        </h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Customer Information -->
        <div class="form-group">
          <label class="form-label required">ชื่อ-นามสกุล</label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">อีเมล</label>
            <input
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="example@email.com"
            />
          </div>

          <div class="form-group">
            <label class="form-label">เบอร์โทร</label>
            <input
              v-model="formData.phone"
              type="tel"
              class="form-input"
              placeholder="081-234-5678"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">ที่อยู่</label>
          <textarea
            v-model="formData.address"
            class="form-textarea"
            rows="3"
            placeholder="ที่อยู่สำหรับจัดส่ง"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">สถานะ</label>
          <select v-model="formData.status" class="form-select">
            <option value="active">ใช้งาน</option>
            <option value="inactive">ไม่ใช้งาน</option>
          </select>
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
  customer?: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  save: []
}>()

const { createCustomer, updateCustomer } = useCustomers()

const loading = ref(false)
const error = ref('')

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active'
})

// Initialize form data
onMounted(() => {
  if (props.customer) {
    formData.value = {
      name: props.customer.name || '',
      email: props.customer.email || '',
      phone: props.customer.phone || '',
      address: props.customer.address || '',
      status: props.customer.status || 'active'
    }
  }
})

// Handle submit
const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (props.customer) {
      const { error: updateError } = await updateCustomer(props.customer.id, formData.value)
      if (updateError) throw updateError
    } else {
      const { error: createError } = await createCustomer(formData.value)
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
  max-width: 600px;
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

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
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

.form-textarea {
  resize: vertical;
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
  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>