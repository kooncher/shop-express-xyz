<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ order ? "แก้ไขคำสั่งซื้อ" : "สร้างคำสั่งซื้อใหม่" }}
        </h2>
        <button @click="$emit('close')" class="close-btn">✕</button>
      </div>

      <!-- แสดง Warning ถ้าชำระเงินแล้ว -->
      <div v-if="isPaid" class="paid-warning">
        <span class="warning-icon">🔒</span>
        <div class="warning-text">
          <strong>ออเดอร์นี้ชำระเงินแล้ว</strong>
          <p>
            ไม่สามารถแก้ไขรายการสินค้าและยอดเงินได้ แก้ไขได้เฉพาะข้อมูลลูกค้า
            ที่อยู่ และสถานะคำสั่งซื้อ
          </p>
        </div>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Customer Information (แก้ไขได้เสมอ) -->
        <div class="section">
          <h3 class="section-title">ข้อมูลลูกค้า</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label class="form-label">เลือกลูกค้าจากระบบ</label>
              <select
                v-model="selectedCustomerId"
                @change="onCustomerSelect"
                class="form-select"
              >
                <option value="">-- เลือกลูกค้า หรือกรอกข้อมูลใหม่ --</option>
                <option
                  v-for="customer in customers"
                  :key="customer.id"
                  :value="customer.id"
                >
                  {{ customer.name }} ({{ customer.phone || "ไม่มีเบอร์" }})
                </option>
              </select>
            </div>
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
                maxlength="10"
                placeholder="0812345678"
              />
            </div>
            <div class="form-group full-width">
              <label class="form-label">ที่อยู่จัดส่ง</label>
              <textarea
                v-model="formData.customer_address"
                class="form-textarea"
                rows="2"
                placeholder="ที่อยู่จัดส่ง"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Order Items (ล็อคถ้าชำระแล้ว) -->
        <div class="section" :class="{ locked: isPaid }">
          <div class="section-header">
            <h3 class="section-title">
              รายการสินค้า
              <span v-if="isPaid" class="lock-badge">🔒 ล็อค</span>
            </h3>
            <button
              v-if="!isPaid"
              type="button"
              @click="addItem"
              class="btn-add-item"
            >
              ➕ เพิ่มสินค้า
            </button>
          </div>
          <div v-if="formData.items.length === 0" class="empty-items">
            <p>ยังไม่มีรายการสินค้า</p>
          </div>
          <div v-else class="items-list">
            <div
              v-for="(item, index) in formData.items"
              :key="index"
              class="item-row"
            >
              <select
                v-model="item.product_id"
                @change="onProductSelect(index)"
                class="form-select"
                :disabled="isPaid"
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
              <input
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="form-input qty-input"
                @input="calculateSubtotal"
                :disabled="isPaid"
                required
              />
              <input
                v-model.number="item.price"
                type="number"
                min="0"
                class="form-input price-input"
                @input="calculateSubtotal"
                :disabled="isPaid"
                required
              />
              <span class="item-total"
                >฿{{ formatNumber(item.quantity * item.price) }}</span
              >
              <button
                v-if="!isPaid"
                type="button"
                @click="removeItem(index)"
                class="btn-remove"
              >
                🗑️
              </button>
              <span v-else class="btn-remove-disabled">🔒</span>
            </div>
          </div>
        </div>

        <!-- Order Summary & Payment (ล็อคถ้าชำระแล้ว) -->
        <div class="section" :class="{ locked: isPaid }">
          <h3 class="section-title">
            สรุปคำสั่งซื้อ
            <span v-if="isPaid" class="lock-badge">🔒 ล็อค</span>
          </h3>
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
                min="0"
                class="form-input"
                @input="calculateTotal"
                :disabled="isPaid"
              />
            </div>
            <div class="form-group">
              <label class="form-label">ค่าจัดส่ง</label>
              <input
                v-model.number="formData.shipping_fee"
                type="number"
                min="0"
                class="form-input"
                @input="calculateTotal"
                :disabled="isPaid"
              />
            </div>
            <div class="form-group">
              <label class="form-label total-label">ยอดรวมสุทธิ</label>
              <input
                :value="formatNumber(formData.total)"
                type="text"
                class="form-input total-input"
                readonly
              />
            </div>
          </div>

          <!-- Payment Buttons (ล็อคถ้าชำระแล้ว) -->
          <div class="payment-section">
            <div class="payment-header">
              <label class="form-label">ชำระเงิน</label>
              <div class="payment-status">
                <span :class="['status-badge', formData.payment_status]">
                  {{
                    formData.payment_status === "paid"
                      ? "✓ ชำระแล้ว"
                      : "○ ยังไม่ชำระ"
                  }}
                </span>
                <span v-if="formData.payment_method" class="method-tag">{{
                  formData.payment_method
                }}</span>
              </div>
            </div>

            <!-- ถ้าชำระแล้ว แสดงข้อความแทนปุ่ม -->
            <div v-if="isPaid" class="payment-locked">
              <div class="locked-info">
                <span class="locked-icon">✓</span>
                <div>
                  <strong>ชำระเงินเรียบร้อยแล้ว</strong>
                  <p>ผ่านช่องทาง: {{ formData.payment_method }}</p>
                </div>
              </div>
              <button type="button" @click="requestRefund" class="btn-refund">
                ↩ คืนเงิน
              </button>
            </div>

            <!-- ถ้ายังไม่ชำระ แสดงปุ่มเลือกช่องทาง -->
            <!-- <div v-else class="payment-buttons">
              <button
                type="button"
                @click="openPayment('โอนเงิน')"
                class="pay-btn"
              >
                <span>🏦</span>โอนเงิน
              </button>
              <button
                type="button"
                @click="openPayment('พร้อมเพย์')"
                class="pay-btn"
              >
                <span>📱</span>พร้อมเพย์
              </button>
              <button
                type="button"
                @click="openPayment('QR Code')"
                class="pay-btn"
              >
                <span>📲</span>QR Code
              </button>
              <button
                type="button"
                @click="openPayment('บัตรเครดิต')"
                class="pay-btn"
              >
                <span>💳</span>บัตรเครดิต
              </button>
              <button
                type="button"
                @click="setCOD"
                class="pay-btn"
                :class="{
                  active: formData.payment_method === 'เก็บเงินปลายทาง',
                }"
              >
                <span>📦</span>ปลายทาง
              </button>
              <button
                type="button"
                @click="openPayment('เงินสด')"
                class="pay-btn"
              >
                <span>💵</span>เงินสด
              </button>
            </div> -->
          </div>
        </div>

        <!-- Status (แก้ไขได้เสมอ) -->
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
              <label class="form-label">หมายเหตุ</label>
              <textarea
                v-model="formData.notes"
                class="form-textarea"
                rows="2"
                placeholder="หมายเหตุ (ถ้ามี)"
              ></textarea>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-cancel">
            ยกเลิก
          </button>
          <button type="submit" :disabled="loading" class="btn-submit">
            {{ loading ? "กำลังบันทึก..." : "บันทึก" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Payment Popup -->
    <Teleport to="body">
      <div
        v-if="showPayment"
        class="payment-overlay"
        @click.self="closePayment"
      >
        <div class="payment-modal">
          <div class="pm-header">
            <h3>{{ paymentMethod }}</h3>
            <button @click="closePayment" class="pm-close">✕</button>
          </div>
          <div class="pm-body">
            <div class="pm-amount">
              <span>ยอดชำระ</span>
              <strong>฿{{ formatNumber(formData.total) }}</strong>
            </div>

            <!-- Bank Transfer -->
            <template v-if="paymentMethod === 'โอนเงิน'">
              <div class="bank-list">
                <div class="bank-item">
                  <div class="bank-logo scb">SCB</div>
                  <div class="bank-info">
                    <strong>ธนาคารไทยพาณิชย์</strong>
                    <span class="acc-num">123-456-7890</span>
                    <small>บริษัท ShopExpressXYZ จำกัด</small>
                  </div>
                  <button
                    type="button"
                    @click="copy('1234567890')"
                    class="copy-btn"
                  >
                    📋
                  </button>
                </div>
                <div class="bank-item">
                  <div class="bank-logo kbank">KBANK</div>
                  <div class="bank-info">
                    <strong>ธนาคารกสิกรไทย</strong>
                    <span class="acc-num">098-765-4321</span>
                    <small>บริษัท ShopExpressXYZ จำกัด</small>
                  </div>
                  <button
                    type="button"
                    @click="copy('0987654321')"
                    class="copy-btn"
                  >
                    📋
                  </button>
                </div>
              </div>
              <div class="upload-section">
                <label>แนบสลิปโอนเงิน</label>
                <div class="upload-box" @click="$refs.fileInput.click()">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    @change="onFileSelect"
                    hidden
                  />
                  <template v-if="!slipPreview">
                    <span class="upload-icon">📤</span>
                    <span>คลิกเพื่ออัพโหลดสลิป</span>
                  </template>
                  <template v-else>
                    <img :src="slipPreview" class="slip-img" />
                    <button
                      type="button"
                      @click.stop="clearSlip"
                      class="clear-slip"
                    >
                      ✕
                    </button>
                  </template>
                </div>
              </div>
            </template>

            <!-- PromptPay -->
            <template v-if="paymentMethod === 'พร้อมเพย์'">
              <div class="qr-section">
                <img
                  :src="`https://promptpay.io/0812345678/${formData.total}.png`"
                  class="qr-img"
                  alt="QR"
                />
                <p class="qr-info">พร้อมเพย์: 081-234-5678</p>
                <small>บริษัท ShopExpressXYZ จำกัด</small>
              </div>
              <div class="upload-section">
                <label>แนบสลิป</label>
                <div class="upload-box" @click="$refs.fileInput2.click()">
                  <input
                    ref="fileInput2"
                    type="file"
                    accept="image/*"
                    @change="onFileSelect"
                    hidden
                  />
                  <template v-if="!slipPreview">
                    <span class="upload-icon">📤</span>
                    <span>คลิกเพื่ออัพโหลด</span>
                  </template>
                  <template v-else>
                    <img :src="slipPreview" class="slip-img" />
                    <button
                      type="button"
                      @click.stop="clearSlip"
                      class="clear-slip"
                    >
                      ✕
                    </button>
                  </template>
                </div>
              </div>
            </template>

            <!-- QR Code -->
            <template v-if="paymentMethod === 'QR Code'">
              <div class="qr-section">
                <div class="qr-placeholder">📲<br />QR Code</div>
                <p class="qr-info">สแกนเพื่อชำระเงิน</p>
              </div>
              <div class="upload-section">
                <label>แนบหลักฐาน</label>
                <div class="upload-box" @click="$refs.fileInput3.click()">
                  <input
                    ref="fileInput3"
                    type="file"
                    accept="image/*"
                    @change="onFileSelect"
                    hidden
                  />
                  <template v-if="!slipPreview">
                    <span class="upload-icon">📤</span>
                    <span>คลิกเพื่ออัพโหลด</span>
                  </template>
                  <template v-else>
                    <img :src="slipPreview" class="slip-img" />
                    <button
                      type="button"
                      @click.stop="clearSlip"
                      class="clear-slip"
                    >
                      ✕
                    </button>
                  </template>
                </div>
              </div>
            </template>

            <!-- Credit Card -->
            <template v-if="paymentMethod === 'บัตรเครดิต'">
              <div class="card-form">
                <div class="card-preview">
                  <div class="card-chip"></div>
                  <div class="card-num">
                    {{ cardNum || "•••• •••• •••• ••••" }}
                  </div>
                  <div class="card-bottom">
                    <span>{{ cardName || "YOUR NAME" }}</span>
                    <span>{{ cardExp || "MM/YY" }}</span>
                  </div>
                </div>
                <input
                  v-model="cardNum"
                  @input="formatCard"
                  class="form-input"
                  placeholder="หมายเลขบัตร"
                  maxlength="19"
                />
                <div class="card-row">
                  <input
                    v-model="cardExp"
                    @input="formatExp"
                    class="form-input"
                    placeholder="MM/YY"
                    maxlength="5"
                  />
                  <input
                    v-model="cardCvv"
                    type="password"
                    class="form-input"
                    placeholder="CVV"
                    maxlength="3"
                  />
                </div>
                <input
                  v-model="cardName"
                  @input="cardName = cardName.toUpperCase()"
                  class="form-input"
                  placeholder="ชื่อบนบัตร"
                />
              </div>
            </template>

            <!-- Cash -->
            <template v-if="paymentMethod === 'เงินสด'">
              <div class="cash-section">
                <div class="cash-icon">💵</div>
                <label>จำนวนเงินที่รับ</label>
                <input
                  v-model.number="cashAmount"
                  type="number"
                  class="form-input cash-input"
                  :placeholder="String(formData.total)"
                />
                <div
                  v-if="cashAmount >= formData.total"
                  class="change-box success"
                >
                  <span>เงินทอน</span>
                  <strong
                    >฿{{ formatNumber(cashAmount - formData.total) }}</strong
                  >
                </div>
                <div v-else-if="cashAmount > 0" class="change-box warning">
                  <span>ยังขาด</span>
                  <strong
                    >฿{{ formatNumber(formData.total - cashAmount) }}</strong
                  >
                </div>
                <div class="quick-btns">
                  <button
                    v-for="amt in quickAmounts"
                    :key="amt"
                    @click="cashAmount = amt"
                    type="button"
                  >
                    ฿{{ amt }}
                  </button>
                </div>
              </div>
            </template>
          </div>
          <div class="pm-footer">
            <button type="button" @click="closePayment" class="btn-cancel">
              ยกเลิก
            </button>
            <button
              type="button"
              @click="confirmPayment"
              :disabled="!canConfirm || processingPayment"
              class="btn-confirm"
            >
              <span v-if="processingPayment" class="spinner"></span>
              <span v-else>✓ ยืนยันชำระเงิน</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Refund Confirmation Popup -->
    <Teleport to="body">
      <div
        v-if="showRefundConfirm"
        class="payment-overlay"
        @click.self="showRefundConfirm = false"
      >
        <div class="refund-modal">
          <div class="refund-icon">↩️</div>
          <h3>ยืนยันการคืนเงิน</h3>
          <p>
            คุณต้องการคืนเงินจำนวน
            <strong>฿{{ formatNumber(formData.total) }}</strong> ใช่หรือไม่?
          </p>
          <p class="refund-note">
            หลังจากคืนเงินแล้ว คุณจะสามารถแก้ไขรายการสินค้าและยอดเงินได้อีกครั้ง
          </p>
          <div class="refund-actions">
            <button @click="showRefundConfirm = false" class="btn-cancel">
              ยกเลิก
            </button>
            <button
              @click="confirmRefund"
              :disabled="processingRefund"
              class="btn-refund-confirm"
            >
              <span v-if="processingRefund" class="spinner"></span>
              <span v-else>ยืนยันคืนเงิน</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

const props = defineProps<{ order?: any }>();
const emit = defineEmits<{ close: []; save: [] }>();

const { createOrder, updateOrder, getOrder, getCustomers } = useOrders();
const { getProducts } = useProducts();

const loading = ref(false);
const error = ref("");
const products = ref<any[]>([]);
const customers = ref<any[]>([]);
const selectedCustomerId = ref("");

// Payment
const showPayment = ref(false);
const paymentMethod = ref("");
const slipPreview = ref("");
const slipFile = ref<File | null>(null);
const processingPayment = ref(false);

// Refund
const showRefundConfirm = ref(false);
const processingRefund = ref(false);

// Card
const cardNum = ref("");
const cardExp = ref("");
const cardCvv = ref("");
const cardName = ref("");

// Cash
const cashAmount = ref(0);

const formData = ref({
  customer_id: null as string | null,
  customer_name: "",
  customer_phone: "",
  customer_address: "",
  payment_method: "",
  items: [] as any[],
  subtotal: 0,
  discount: 0,
  shipping_fee: 0,
  total: 0,
  status: "pending",
  payment_status: "unpaid",
  notes: "",
});

// ตรวจสอบว่าชำระเงินแล้วหรือยัง
const isPaid = computed(() => formData.value.payment_status === "paid");

const quickAmounts = computed(() => {
  const t = formData.value.total;
  return [
    Math.ceil(t / 100) * 100,
    Math.ceil(t / 500) * 500,
    Math.ceil(t / 1000) * 1000,
  ]
    .filter((v, i, a) => a.indexOf(v) === i && v >= t)
    .slice(0, 3);
});

const canConfirm = computed(() => {
  if (processingPayment.value) return false;
  if (["โอนเงิน", "พร้อมเพย์", "QR Code"].includes(paymentMethod.value))
    return !!slipFile.value;
  if (paymentMethod.value === "บัตรเครดิต")
    return (
      cardNum.value.replace(/\s/g, "").length === 16 &&
      cardExp.value.length === 5 &&
      cardCvv.value.length === 3 &&
      cardName.value.length > 0
    );
  if (paymentMethod.value === "เงินสด")
    return cashAmount.value >= formData.value.total;
  return false;
});

const openPayment = (method: string) => {
  // ต้องบันทึก Order ก่อนถึงจะชำระเงินได้
  if (!props.order) {
    alert("กรุณาบันทึกคำสั่งซื้อก่อนชำระเงิน");
    return;
  }
  if (formData.value.total <= 0) {
    alert("กรุณาเพิ่มสินค้าก่อน");
    return;
  }
  paymentMethod.value = method;
  showPayment.value = true;
  resetFields();
};

const closePayment = () => {
  showPayment.value = false;
  resetFields();
};

const setCOD = () => {
  formData.value.payment_method = "เก็บเงินปลายทาง";
  formData.value.payment_status = "unpaid";
};

const resetFields = () => {
  slipPreview.value = "";
  slipFile.value = null;
  cardNum.value = "";
  cardExp.value = "";
  cardCvv.value = "";
  cardName.value = "";
  cashAmount.value = 0;
};

const onFileSelect = (e: Event) => {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) {
    slipFile.value = f;
    const r = new FileReader();
    r.onload = (ev) => {
      slipPreview.value = ev.target?.result as string;
    };
    r.readAsDataURL(f);
  }
};

const clearSlip = () => {
  slipPreview.value = "";
  slipFile.value = null;
};

const formatCard = () => {
  let v = cardNum.value.replace(/\D/g, "").slice(0, 16);
  cardNum.value = v.replace(/(\d{4})/g, "$1 ").trim();
};

const formatExp = () => {
  let v = cardExp.value.replace(/\D/g, "");
  if (v.length >= 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
  cardExp.value = v;
};

const copy = (t: string) => {
  navigator.clipboard.writeText(t);
  alert("คัดลอกแล้ว!");
};

// ✅ ยืนยันชำระเงิน - บันทึกลง Database ทันที
const confirmPayment = async () => {
  if (!props.order?.id) {
    alert("ไม่พบ Order ID");
    return;
  }

  processingPayment.value = true;

  try {
    // อัพเดท payment_status และ payment_method ลง Database
    const { error: updateError } = await updateOrder(props.order.id, {
      payment_method: paymentMethod.value,
      payment_status: "paid",
    });

    if (updateError) {
      throw updateError;
    }

    // อัพเดท local state
    formData.value.payment_method = paymentMethod.value;
    formData.value.payment_status = "paid";

    closePayment();

    // แจ้ง parent component ให้ refresh ข้อมูล
    emit("save");
  } catch (err: any) {
    alert(
      "เกิดข้อผิดพลาด: " + (err.message || "ไม่สามารถบันทึกการชำระเงินได้"),
    );
  } finally {
    processingPayment.value = false;
  }
};

// ขอคืนเงิน
const requestRefund = () => {
  showRefundConfirm.value = true;
};

// ✅ ยืนยันคืนเงิน - บันทึกลง Database ทันที
const confirmRefund = async () => {
  if (!props.order?.id) {
    alert("ไม่พบ Order ID");
    return;
  }

  processingRefund.value = true;

  try {
    // อัพเดท payment_status เป็น unpaid และลบ payment_method
    const { error: updateError } = await updateOrder(props.order.id, {
      payment_method: "",
      payment_status: "unpaid",
    });

    if (updateError) {
      throw updateError;
    }

    // อัพเดท local state
    formData.value.payment_status = "unpaid";
    formData.value.payment_method = "";

    showRefundConfirm.value = false;

    // แจ้ง parent component ให้ refresh ข้อมูล
    emit("save");
  } catch (err: any) {
    alert("เกิดข้อผิดพลาด: " + (err.message || "ไม่สามารถคืนเงินได้"));
  } finally {
    processingRefund.value = false;
  }
};

const formatNumber = (n: number) =>
  new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);

const loadProducts = async () => {
  const { data } = await getProducts();
  if (data) products.value = data;
};
const loadCustomers = async () => {
  const { data } = await getCustomers();
  if (data) customers.value = data;
};

const onCustomerSelect = () => {
  if (selectedCustomerId.value) {
    const c = customers.value.find((x) => x.id === selectedCustomerId.value);
    if (c) {
      formData.value.customer_id = c.id;
      formData.value.customer_name = c.name || "";
      formData.value.customer_phone = c.phone || "";
      formData.value.customer_address = c.address || "";
    }
  } else {
    formData.value.customer_id = null;
  }
};

onMounted(async () => {
  await Promise.all([loadProducts(), loadCustomers()]);
  if (props.order) {
    const { data, error: fetchError } = await getOrder(props.order.id);
    if (data) {
      // ✅ มั่นใจว่า items ถูกส่งเข้าไปใน formData
      formData.value = { 
        ...data, 
        items: data.items || [] // ป้องกันกรณี items เป็น null
      };
      if (data.customer_id) selectedCustomerId.value = data.customer_id;
    }
    if (fetchError) console.error("Error fetching items:", fetchError);
  }
});

const addItem = () => {
  formData.value.items.push({
    product_id: "",
    product_name: "",
    quantity: 1,
    price: 0,
  });
};
const removeItem = (i: number) => {
  formData.value.items.splice(i, 1);
  calculateSubtotal();
};

const onProductSelect = (i: number) => {
  const item = formData.value.items[i];
  const p = products.value.find((x) => x.id === item.product_id);
  if (p) {
    item.product_name = p.name;
    item.price = p.price;
    calculateSubtotal();
  }
};

const calculateSubtotal = () => {
  formData.value.subtotal = formData.value.items.reduce(
    (s, i) => s + i.quantity * i.price,
    0,
  );
  calculateTotal();
};

const calculateTotal = () => {
  formData.value.total =
    formData.value.subtotal -
    (formData.value.discount || 0) +
    (formData.value.shipping_fee || 0);
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = "";
    if (!formData.value.items.length) {
      error.value = "กรุณาเพิ่มสินค้า";
      return;
    }
    if (props.order) {
      const { error: e } = await updateOrder(props.order.id, formData.value);
      if (e) throw e;
    } else {
      const { error: e } = await createOrder(formData.value);
      if (e) throw e;
    }
    emit("save");
  } catch (e: any) {
    error.value = e.message || "เกิดข้อผิดพลาด";
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
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
}
.modal-container {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 10;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
}
.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.1rem;
}

/* Warning Banner */
.paid-warning {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fef3c7;
  border-bottom: 1px solid #fcd34d;
}
.warning-icon {
  font-size: 1.5rem;
}
.warning-text strong {
  color: #92400e;
  display: block;
  margin-bottom: 0.25rem;
}
.warning-text p {
  color: #a16207;
  font-size: 0.85rem;
  margin: 0;
}

.modal-body {
  padding: 1.25rem;
}
.section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: opacity 0.2s;
}
.section.locked {
  opacity: 0.85;
}
.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.lock-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 9999px;
  font-weight: 500;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.btn-add-item {
  padding: 0.4rem 0.8rem;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
}
.form-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group.full-width {
  grid-column: 1/-1;
}
.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.35rem;
}
.form-label.required::after {
  content: " *";
  color: #ef4444;
}
.form-input,
.form-select,
.form-textarea {
  padding: 0.6rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.4rem;
  font-size: 0.9rem;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}
.form-input:disabled,
.form-select:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.total-label {
  font-weight: 700;
}
.total-input {
  font-weight: 700;
  color: #059669;
}
.empty-items {
  text-align: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.item-row {
  display: grid;
  grid-template-columns: 2fr 70px 90px 80px 36px;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.4rem;
}
.qty-input {
  width: 70px;
}
.price-input {
  width: 90px;
}
.item-total {
  font-weight: 600;
  font-size: 0.85rem;
  text-align: right;
}
.btn-remove {
  width: 32px;
  height: 32px;
  border: none;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.4rem;
  cursor: pointer;
}
.btn-remove-disabled {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
.payment-section {
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #e5e7eb;
}
.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.payment-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.status-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.status-badge.paid {
  background: #d1fae5;
  color: #065f46;
}
.status-badge.unpaid {
  background: #fef3c7;
  color: #92400e;
}
.method-tag {
  padding: 0.2rem 0.4rem;
  background: #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.7rem;
}

/* Payment Locked State */
.payment-locked {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #d1fae5;
  border-radius: 0.6rem;
}
.locked-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.locked-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: #059669;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.locked-info strong {
  color: #065f46;
  display: block;
}
.locked-info p {
  color: #047857;
  font-size: 0.8rem;
  margin: 0;
}
.btn-refund {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #dc2626;
  border: 2px solid #dc2626;
  border-radius: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-refund:hover {
  background: #dc2626;
  color: #fff;
}

.payment-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.pay-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.6rem;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}
.pay-btn span {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}
.pay-btn:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}
.pay-btn.active {
  border-color: #f59e0b;
  background: #fffbeb;
}
.error-msg {
  margin-top: 0.75rem;
  padding: 0.6rem;
  background: #fee2e2;
  border-radius: 0.4rem;
  color: #991b1b;
  font-size: 0.85rem;
}
.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}
.btn-cancel,
.btn-submit {
  padding: 0.6rem 1.25rem;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
}
.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}
.btn-submit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Payment Popup */
.payment-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}
.payment-modal {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.pm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}
.pm-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
}
.pm-close {
  width: 28px;
  height: 28px;
  border: none;
  background: #f3f4f6;
  border-radius: 0.4rem;
  cursor: pointer;
}
.pm-body {
  padding: 1rem;
}
.pm-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 0.6rem;
  color: #fff;
  margin-bottom: 1rem;
}
.pm-amount span {
  font-size: 0.85rem;
  opacity: 0.9;
}
.pm-amount strong {
  font-size: 1.5rem;
}
.bank-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.bank-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}
.bank-logo {
  width: 40px;
  height: 40px;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.6rem;
  color: #fff;
}
.bank-logo.scb {
  background: #4e2a84;
}
.bank-logo.kbank {
  background: #138f2d;
}
.bank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.bank-info strong {
  font-size: 0.85rem;
}
.acc-num {
  font-size: 1rem;
  font-weight: 700;
  color: #3b82f6;
  font-family: monospace;
}
.bank-info small {
  font-size: 0.7rem;
  color: #6b7280;
}
.copy-btn {
  width: 36px;
  height: 36px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
}
.upload-section {
  margin-top: 1rem;
}
.upload-section label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  position: relative;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: all 0.2s;
}
.upload-box:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}
.upload-icon {
  font-size: 2rem;
  margin-bottom: 0.25rem;
}
.slip-img {
  max-width: 100%;
  max-height: 150px;
  border-radius: 0.4rem;
}
.clear-slip {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
}
.qr-section {
  text-align: center;
}
.qr-img {
  width: 180px;
  height: 180px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
.qr-placeholder {
  width: 180px;
  height: 180px;
  margin: 0 auto;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #9ca3af;
}
.qr-info {
  margin-top: 0.5rem;
  font-weight: 600;
}
.card-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.card-preview {
  background: linear-gradient(135deg, #1e3a5f, #0f172a);
  border-radius: 0.75rem;
  padding: 1.25rem;
  color: #fff;
  margin-bottom: 0.5rem;
}
.card-chip {
  width: 40px;
  height: 28px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}
.card-num {
  font-size: 1.1rem;
  font-family: monospace;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}
.card-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  text-transform: uppercase;
}
.card-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.cash-section {
  text-align: center;
}
.cash-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}
.cash-input {
  font-size: 1.25rem;
  text-align: center;
  font-weight: 700;
}
.change-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-top: 0.75rem;
}
.change-box.success {
  background: #d1fae5;
}
.change-box.warning {
  background: #fee2e2;
}
.change-box strong {
  font-size: 1.1rem;
}
.quick-btns {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
.quick-btns button {
  padding: 0.4rem 0.75rem;
  background: #e5e7eb;
  border: none;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.8rem;
}
.quick-btns button:hover {
  background: #3b82f6;
  color: #fff;
}
.pm-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}
.pm-footer button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-confirm {
  background: linear-gradient(135deg, #059669, #047857);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Refund Modal */
.refund-modal {
  background: #fff;
  border-radius: 1rem;
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  text-align: center;
  animation: slideUp 0.3s ease;
}
.refund-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.refund-modal h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.refund-modal p {
  color: #6b7280;
  margin-bottom: 0.5rem;
}
.refund-modal strong {
  color: #111827;
}
.refund-note {
  font-size: 0.8rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}
.refund-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.refund-actions button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-refund-confirm {
  background: #dc2626;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.btn-refund-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .form-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
  .payment-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  .item-row {
    grid-template-columns: 1fr;
  }
  .payment-locked {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
