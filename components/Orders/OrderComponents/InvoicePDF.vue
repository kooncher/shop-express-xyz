<template>
  <div class="invoice-page">
    <!-- Action Bar -->
    <div class="action-bar no-print">
      <button @click="downloadPDF" :disabled="isGeneratingPDF" class="btn-action btn-pdf">
        {{ isGeneratingPDF ? '⏳ กำลังสร้าง PDF...' : '📥 ดาวน์โหลด PDF' }}
      </button>
      <!-- <button @click="printInvoice" class="btn-action btn-print">
        🖨️ พิมพ์
      </button> -->
      <button @click="$emit('close')" class="btn-action btn-back">
        ← กลับ
      </button>
    </div>

    <!-- Invoice Document -->
    <div ref="invoiceContent" class="invoice-document">
      <!-- Header -->
      <div class="invoice-header">
        <div class="company-info">
          <h1 class="company-name">{{ companyInfo.name }}</h1>
          <p class="company-detail">{{ companyInfo.address }}</p>
          <p class="company-detail">โทร: {{ companyInfo.phone }}</p>
          <p class="company-detail">Email: {{ companyInfo.email }}</p>
          <p class="company-detail" v-if="companyInfo.taxId">
            เลขประจำตัวผู้เสียภาษี: {{ companyInfo.taxId }}
          </p>
        </div>
        <div class="invoice-title-section">
          <h2 class="invoice-title">ใบสั่งซื้อ</h2>
          <p class="invoice-subtitle">PURCHASE ORDER</p>
        </div>
      </div>

      <div class="invoice-divider"></div>

      <!-- Order & Customer Info -->
      <div class="invoice-info-section">
        <div class="invoice-info-left">
          <div class="info-row">
            <span class="info-label">เลขที่ใบสั่งซื้อ:</span>
            <span class="info-value">{{ orderData.order_number }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วันที่สั่งซื้อ:</span>
            <span class="info-value">{{ formatInvoiceDate(orderData.created_at) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">วิธีชำระเงิน:</span>
            <span class="info-value">{{ orderData.payment_method || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">สถานะ:</span>
            <span class="info-value">{{ getStatusLabel(orderData.status) }}</span>
          </div>
        </div>
        <div class="invoice-info-right">
          <h3 class="customer-title">ข้อมูลลูกค้า</h3>
          <p class="customer-name">{{ orderData.customer_name }}</p>
          <p class="customer-detail" v-if="orderData.customer_phone">
            โทร: {{ orderData.customer_phone }}
          </p>
          <p class="customer-detail" v-if="orderData.customer_address">
            ที่อยู่: {{ orderData.customer_address }}
          </p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="invoice-table-section">
        <table class="invoice-table">
          <thead>
            <tr>
              <th class="th-no">ลำดับ</th>
              <th class="th-product">รายการสินค้า</th>
              <th class="th-sku">SKU</th>
              <th class="th-price">ราคาต่อหน่วย</th>
              <th class="th-qty">จำนวน</th>
              <th class="th-total">ราคารวม</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in orderData.items" :key="item.id">
              <td class="td-no">{{ index + 1 }}</td>
              <td class="td-product">{{ item.product_name }}</td>
              <td class="td-sku">{{ item.product_sku || '-' }}</td>
              <td class="td-price">฿{{ formatNumber(item.price) }}</td>
              <td class="td-qty">{{ item.quantity }}</td>
              <td class="td-total">฿{{ formatNumber(item.subtotal) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Summary -->
      <div class="invoice-summary-section">
        <div class="summary-spacer"></div>
        <div class="summary-box">
          <div class="summary-row">
            <span class="summary-label">ยอดรวมสินค้า:</span>
            <span class="summary-value">฿{{ formatNumber(orderData.subtotal) }}</span>
          </div>
          <div class="summary-row" v-if="orderData.discount > 0">
            <span class="summary-label">ส่วนลด:</span>
            <span class="summary-value discount">-฿{{ formatNumber(orderData.discount) }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">ค่าจัดส่ง:</span>
            <span class="summary-value">฿{{ formatNumber(orderData.shipping_fee) }}</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total-row">
            <span class="summary-label-total">ยอดรวมสุทธิ:</span>
            <span class="summary-value-total">฿{{ formatNumber(orderData.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="invoice-notes" v-if="orderData.notes">
        <p class="notes-label">หมายเหตุ:</p>
        <p class="notes-text">{{ orderData.notes }}</p>
      </div>

      <!-- Footer -->
      <div class="invoice-footer">
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-label">ผู้สั่งซื้อ</p>
            <p class="signature-date">วันที่ .........................</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-label">ผู้รับสินค้า</p>
            <p class="signature-date">วันที่ .........................</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p class="signature-label">ผู้อนุมัติ</p>
            <p class="signature-date">วันที่ .........................</p>
          </div>
        </div>
        <div class="thank-you">
          <p>ขอบคุณที่ใช้บริการ</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface Props {
  order: any
  companyInfo?: {
    name: string
    address: string
    phone: string
    email: string
    taxId?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  companyInfo: () => ({
    name: 'ShopExpressXYZ',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110',
    phone: '02-123-4567',
    email: 'info@shopexpress.com',
    taxId: '0123456789012'
  })
})

defineEmits<{
  close: []
}>()

const invoiceContent = ref(null)
const orderData = ref(props.order)
const isGeneratingPDF = ref(false)

const printInvoice = () => {
  // ซ่อน action bar ชั่วคราว
  const actionBar = document.querySelector('.action-bar') as HTMLElement
  if (actionBar) {
    actionBar.style.display = 'none'
  }

  // พิมพ์
  window.print()

  // แสดง action bar กลับมา
  setTimeout(() => {
    if (actionBar) {
      actionBar.style.display = 'flex'
    }
  }, 100)
}

const downloadPDF = async () => {
  if (!invoiceContent.value || isGeneratingPDF.value) return

  try {
    isGeneratingPDF.value = true
    
    const element = invoiceContent.value as HTMLElement
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgWidth = 210
    const pageHeight = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgData = canvas.toDataURL('image/jpeg', 0.98)
    
    // ถ้าความสูงน้อยกว่าหรือเท่ากับ 1 หน้า ให้ใส่แค่หน้าเดียว
    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight)
    } else {
      // ถ้ามากกว่า 1 หน้า ให้แบ่งหน้า
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }
    }

    pdf.save(`Invoice-${orderData.value.order_number}.pdf`)
    
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง')
  } finally {
    isGeneratingPDF.value = false
  }
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const formatInvoiceDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

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

watch(() => props.order, (newOrder) => {
  orderData.value = newOrder
}, { deep: true })
</script>

<style scoped>
.invoice-page {
  min-height: 100vh;
  background: #f3f4f6;
  padding: 2rem;
}

/* Action Bar */
.action-bar {
  max-width: 900px;
  margin: 0 auto 2rem;
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 1rem;
  z-index: 10;
}

.btn-action {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.btn-pdf {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-pdf:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}

.btn-pdf:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-print {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: white;
}

.btn-print:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
}

.btn-back {
  background: #6b7280;
  color: white;
  margin-left: auto;
}

.btn-back:hover {
  background: #4b5563;
}

/* Invoice Document */
.invoice-document {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  font-family: 'Sarabun', 'Sukhumvit Set', sans-serif;
}

/* Header */
.invoice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.company-info {
  flex: 1;
}

.company-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.company-detail {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
  line-height: 1.5;
}

.invoice-title-section {
  text-align: right;
}

.invoice-title {
  font-size: 2rem;
  font-weight: 700;
  color: #8b5cf6;
  margin: 0;
}

.invoice-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.invoice-divider {
  height: 3px;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  margin: 1.5rem 0;
}

/* Info Section */
.invoice-info-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-label {
  font-weight: 600;
  color: #374151;
  min-width: 140px;
  font-size: 0.9rem;
}

.info-value {
  color: #111827;
  font-size: 0.9rem;
}

.customer-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.customer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.customer-detail {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0;
  line-height: 1.6;
}

/* Table */
.invoice-table-section {
  margin-bottom: 2rem;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #e5e7eb;
}

.invoice-table thead {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.invoice-table th {
  padding: 0.875rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.invoice-table td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #111827;
}

.invoice-table tbody tr:nth-child(even) {
  background: #f9fafb;
}

.th-no, .td-no {
  width: 60px;
  text-align: center;
}

.th-product, .td-product {
  width: 35%;
}

.th-sku, .td-sku {
  width: 15%;
  text-align: center;
}

.th-price, .td-price,
.th-qty, .td-qty,
.th-total, .td-total {
  text-align: right;
}

.th-price, .td-price {
  width: 15%;
}

.th-qty, .td-qty {
  width: 10%;
}

.th-total, .td-total {
  width: 15%;
  font-weight: 600;
}

/* Summary */
.invoice-summary-section {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  margin-bottom: 2rem;
}

.summary-box {
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background: #f9fafb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.625rem 0;
  font-size: 0.9rem;
}

.summary-label {
  color: #6b7280;
  font-weight: 500;
}

.summary-value {
  color: #111827;
  font-weight: 600;
}

.summary-value.discount {
  color: #dc2626;
}

.summary-divider {
  height: 2px;
  background: #d1d5db;
  margin: 0.75rem 0;
}

.total-row {
  padding: 1rem 0 0 0;
  border-top: 3px solid #111827;
  margin-top: 0.5rem;
}

.summary-label-total {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.summary-value-total {
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
}

/* Notes */
.invoice-notes {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  border-radius: 0.25rem;
}

.notes-label {
  font-weight: 700;
  color: #92400e;
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.notes-text {
  color: #78350f;
  margin: 0;
  line-height: 1.6;
  font-size: 0.875rem;
}

/* Footer */
.invoice-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.signature-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.signature-box {
  text-align: center;
}

.signature-line {
  width: 100%;
  height: 60px;
  border-bottom: 1px solid #111827;
  margin-bottom: 0.5rem;
}

.signature-label {
  font-weight: 600;
  color: #111827;
  margin: 0.5rem 0;
  font-size: 0.875rem;
}

.signature-date {
  color: #6b7280;
  margin: 0;
  font-size: 0.75rem;
}

.thank-you {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  border-radius: 0.5rem;
}

.thank-you p {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #6b21a8;
}

/* Print Styles */
@media print {
  /* ซ่อนทุกอย่างก่อน */
  * {
    visibility: hidden !important;
  }

  /* แสดงเฉพาะ invoice-page และลูก ๆ */
  .invoice-page,
  .invoice-page *,
  .invoice-document,
  .invoice-document * {
    visibility: visible !important;
  }

  /* ซ่อน action bar */
  .no-print,
  .action-bar {
    display: none !important;
    visibility: hidden !important;
  }

  /* Reset พื้นหลัง */
  .invoice-page {
    background: white !important;
    padding: 0 !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
  }

  /* ปรับ invoice document */
  .invoice-document {
    max-width: 100% !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* ตั้งค่ากระดาษ */
  @page {
    size: A4;
    margin: 1.5cm;
  }

  /* ป้องกันการแบ่งหน้า */
  .invoice-table,
  .signature-section,
  .invoice-summary-section {
    page-break-inside: avoid;
  }

  /* รักษาสีของ gradient และ background */
  .invoice-title,
  .invoice-divider,
  .invoice-table thead,
  .thank-you,
  .invoice-notes {
    print-color-adjust: exact !important;
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
}

@media (max-width: 768px) {
  .invoice-page {
    padding: 1rem;
  }

  .action-bar {
    flex-direction: column;
  }

  .btn-back {
    margin-left: 0;
  }

  .invoice-document {
    padding: 1.5rem;
  }

  .invoice-header {
    flex-direction: column;
    gap: 1.5rem;
  }

  .invoice-title-section {
    text-align: left;
  }

  .invoice-info-section {
    grid-template-columns: 1fr;
  }

  .invoice-summary-section {
    grid-template-columns: 1fr;
  }

  .signature-section {
    grid-template-columns: 1fr;
  }
}
</style>