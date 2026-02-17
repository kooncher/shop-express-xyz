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

        <h3 class="section-title">เลือกช่องทางการชำระเงิน</h3>

        <div class="payment-grid">
          <label
            v-for="method in paymentMethods"
            :key="method.id"
            class="method-card"
          >
            <input
              type="radio"
              :value="method.id"
              v-model="selectedMethod"
              class="method-radio"
            />
            <div class="method-content">
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-label">{{ method.label }}</span>
            </div>
          </label>
        </div>

        <div class="payment-detail-box">
          <div
            v-if="['bank', 'promptpay', 'qrcode'].includes(selectedMethod)"
            class="transfer-details"
          >
            <div v-if="selectedMethod !== 'bank'" class="qr-container">
              <img
                :src="`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY_ID`"
                class="qr-img"
              />
              <p class="hint">สแกนเพื่อชำระเงิน</p>
            </div>

            <div class="bank-card">
              <div class="bank-brand">🏦 ข้อมูลบัญชีรับเงิน</div>
              <div class="bank-row">
                <span>ธนาคาร:</span> <strong>กสิกรไทย</strong>
              </div>
              <div class="bank-row">
                <span>เลขบัญชี:</span>
                <strong class="acc-number">123-4-56789-0</strong>
              </div>
              <div class="bank-row">
                <span>ชื่อบัญชี:</span> <strong>บจก. ช้อปเอ็กซ์เพรส</strong>
              </div>
            </div>
          </div>

          <div
            v-else-if="['cod', 'cash'].includes(selectedMethod)"
            class="info-alert"
          >
            <span class="info-icon">📍</span>
            <p>
              กรุณาเตรียมเงินสดให้พอดีกับยอดชำระเพื่อจ่ายกับพนักงานเมื่อได้รับสินค้า
            </p>
          </div>

          <div v-else-if="selectedMethod === 'credit'" class="credit-card-section">
  <div class="info-alert info-blue">
    <span class="info-icon">💳</span>
    <p>ชำระผ่านบัตรเครดิต/เดบิต (ค่าธรรมเนียม 3%)</p>
  </div>
  
  <div class="dummy-credit-form">
    <div class="form-group">
      <label>หมายเลขบัตร</label>
      <input type="text" placeholder="**** **** **** ****"  class="input-disabled" />
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>วันหมดอายุ</label>
        <input type="text" placeholder="MM/YY"  class="input-disabled" />
      </div>
      <div class="form-group">
        <label>CVV</label>
        <input type="password" placeholder="***"  class="input-disabled" />
      </div>
    </div>
    <p class="redirect-notice">* ระบบจะเปิดหน้าต่างชำระเงินที่ปลอดภัยของธนาคารเพื่อดำเนินการต่อ</p>
  </div>
</div>
        </div>

        <div
          class="upload-section"
          v-if="['bank', 'promptpay', 'qrcode'].includes(selectedMethod)"
        >
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
          :disabled="
            (['bank', 'promptpay', 'qrcode'].includes(selectedMethod) &&
              !selectedFile) ||
            loading
          "
          @click="submitPayment"
        >
          {{ loading ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน" }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({ order: Object });
const emit = defineEmits(["close", "success"]);

const loading = ref(false);
const selectedMethod = ref("promptpay"); // ค่าเริ่มต้น
const selectedFile = ref(null);
const previewImage = ref(null);

const paymentMethods = [
  { id: "bank", label: "โอนเงิน", icon: "🏦" },
  { id: "promptpay", label: "พร้อมเพย์", icon: "📱" },
  { id: "qrcode", label: "QR Code", icon: "📷" },
  // { id: "credit", label: "บัตรเครดิต", icon: "💳" },
  { id: "cod", label: "ปลายทาง", icon: "📦" },
  { id: "cash", label: "เงินสด", icon: "💵" },
];

const formatNumber = (num) => {
  return new Intl.NumberFormat("th-TH", { minimumFractionDigits: 2 }).format(
    num || 0,
  );
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    selectedFile.value = file;
    previewImage.value = URL.createObjectURL(file);
  }
};

const submitPayment = async () => {
  loading.value = true;
  try {
    // Logic: ส่ง selectedMethod.value และ selectedFile ไปยัง Supabase ของคุณ
    await new Promise((r) => setTimeout(r, 1500));
    alert("บันทึกข้อมูลการชำระเงินเรียบร้อยแล้ว");
    emit("success");
    emit("close");
  } catch (err) {
    alert("เกิดข้อผิดพลาด");
  } finally {
    loading.value = false;
  }
};
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
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
.modal-header {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}
.modal-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
}
.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
  max-height: 75vh;
  overflow-y: auto;
}

.amount-summary {
  background: #f8fafc;
  padding: 1rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  border: 1px dashed #e2e8f0;
}
.amount-summary .label {
  color: #64748b;
  font-size: 0.85rem;
  margin-bottom: 4px;
}
.amount-summary .value {
  color: #4f46e5;
  font-size: 1.8rem;
  font-weight: 800;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.75rem;
}

/* Payment Grid */
.payment-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 1.5rem;
}
.method-card {
  cursor: pointer;
}
.method-radio {
  position: absolute;
  opacity: 0;
}
.method-content {
  background: white;
  border: 2px solid #f1f5f9;
  border-radius: 12px;
  padding: 12px 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}
.method-radio:checked + .method-content {
  border-color: #4f46e5;
  background: #f5f3ff;
}
.method-icon {
  font-size: 1.4rem;
}
.method-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
}
.method-radio:checked + .method-content .method-label {
  color: #4f46e5;
}

/* Detail Boxes */
.payment-detail-box {
  margin-bottom: 1.5rem;
}
.qr-container {
  text-align: center;
  margin-bottom: 1rem;
}
.qr-img {
  width: 160px;
  height: 160px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 5px;
}
.hint {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 5px;
}

.bank-card {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #dbeafe;
}
.bank-brand {
  font-size: 0.85rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 8px;
}
.bank-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 4px;
  color: #1e293b;
}
.acc-number {
  color: #1d4ed8;
  font-size: 1rem;
}

.info-alert {
  display: flex;
  gap: 12px;
  padding: 1rem;
  background: #fff7ed;
  border-radius: 12px;
  border: 1px solid #ffedd5;
  align-items: center;
}
.info-alert p {
  font-size: 0.85rem;
  color: #9a3412;
  margin: 0;
}
.info-blue {
  background: #f0f9ff;
  border-color: #e0f2fe;
}
.info-blue p {
  color: #0369a1;
}

/* Upload Zone */
.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
}
.drop-zone:hover {
  border-color: #4f46e5;
  background: #f8fafc;
}
.slip-preview {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
}

.modal-footer {
  padding: 1.25rem;
  display: flex;
  gap: 12px;
  background: #f9fafb;
}
.btn-primary {
  flex: 2;
  background: #4f46e5;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
.btn-secondary {
  flex: 1;
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}



.credit-card-section {
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.dummy-credit-form {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 4px;
}

.input-disabled {
  width: 100%;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  /* cursor: not-allowed; */
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.redirect-notice {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 10px;
  text-align: center;
}
</style>
