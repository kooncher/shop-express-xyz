<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <header class="modal-header">
        <h2 class="modal-title">ชำระเงินออเดอร์ {{ order?.order_number }}</h2>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </header>

      <div class="modal-body">
        <div class="amount-summary">
          <p class="label">ยอดชำระทั้งสิ้น</p>
          <p class="value">฿{{ formatNumber(order?.total) }}</p>
        </div>

        <div class="payment-methods">
          <h3 class="section-title">ช่องทางการชำระเงิน</h3>
          
          <div class="qr-section">
            <div class="qr-placeholder">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=promptpay_logic" alt="QR Code" />
            </div>
            <p class="qr-text">สแกน QR Code เพื่อชำระเงิน</p>
          </div>

          <div class="bank-details">
            <div class="bank-item">
              <span class="bank-icon">🏦</span>
              <div class="bank-info">
                <p class="bank-name">ธนาคารกสิกรไทย</p>
                <p class="account-number">123-4-56789-0</p>
                <p class="account-holder">บริษัท ช้อปเอ็กซ์เพรส จำกัด</p>
              </div>
            </div>
          </div>
        </div>

        <div class="upload-section">
          <h3 class="section-title">แนบหลักฐานการโอน (สลิป)</h3>
          <div 
            class="drop-zone" 
            :class="{ 'has-file': previewImage }"
            @click="$refs.fileInput.click()"
          >
            <input 
              type="file" 
              ref="fileInput" 
              hidden 
              accept="image/*" 
              @change="handleFileChange" 
            />
            
            <div v-if="!previewImage" class="upload-placeholder">
              <span class="upload-icon">📸</span>
              <p>คลิกเพื่อเลือกรูปภาพสลิป</p>
            </div>
            
            <img v-else :src="previewImage" class="slip-preview" />
          </div>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="btn-secondary" @click="$emit('close')">ยกเลิก</button>
        <button 
          class="btn-primary" 
          :disabled="!selectedFile || loading" 
          @click="submitPayment"
        >
          {{ loading ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  order: Object
})
const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const selectedFile = ref(null)
const previewImage = ref(null)

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    previewImage.value = URL.createObjectURL(file)
  }
}

const submitPayment = async () => {
  loading.value = true
  try {
    // 1. Logic อัปโหลดรูปไปที่ Supabase Storage (ถ้ามี)
    // 2. อัปเดต payment_status ใน table orders เป็น 'paid' หรือรอตรวจสอบ
    
    // จำลองการทำงาน
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    alert('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว ระบบจะตรวจสอบโดยเร็วที่สุด')
    emit('success')
    emit('close')
  } catch (err) {
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่')
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
  z-index: 3000;
  padding: 1rem;
}

.modal-content {
  background: white;
  width: 100%;
  max-width: 500px;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title { font-size: 1.25rem; font-weight: 700; color: #111827; }

.modal-body { padding: 1.5rem; max-height: 70vh; overflow-y: auto; }

.amount-summary {
  background: #f8fafc;
  padding: 1.25rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.amount-summary .label { color: #64748b; font-size: 0.875rem; }
.amount-summary .value { color: #4f46e5; font-size: 2rem; font-weight: 800; }

.section-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }

.qr-section { text-align: center; margin-bottom: 1.5rem; }
.qr-placeholder img { width: 180px; height: 180px; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
.qr-text { margin-top: 0.5rem; color: #64748b; font-size: 0.875rem; }

.bank-details { background: #eff6ff; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; }
.bank-item { display: flex; gap: 1rem; align-items: center; }
.bank-icon { font-size: 1.5rem; }
.bank-name { font-weight: 600; font-size: 0.95rem; }
.account-number { font-size: 1.1rem; font-weight: 700; color: #1e40af; }

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
}

.drop-zone:hover { border-color: #4f46e5; background: #f5f3ff; }
.slip-preview { max-width: 100%; border-radius: 0.5rem; }

.modal-footer {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  background: #f9fafb;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
}

.btn-primary { background: #4f46e5; color: white; border: none; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }
.btn-secondary { background: white; border: 1px solid #e2e8f0; color: #475569; }
</style>