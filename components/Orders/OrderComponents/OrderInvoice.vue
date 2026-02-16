<template>
  <div class="invoice-print-container">
    <!-- ปุ่มเปิด Invoice -->
    <!-- <button @click="openInvoice" class="btn-generate-invoice" v-if="isAdmin">
      📄 สร้างใบสั่งซื้อ
    </button> -->

    <!-- Invoice Page (Full Screen) -->
    <teleport to="body">
      <div v-if="showInvoice" class="invoice-fullscreen">
        <InvoicePage :order="orderData" @close="closeInvoice" />
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import InvoicePage from './InvoicePDF.vue'

interface Props {
  order: any
}
const { user } = useAuth() // ดึงข้อมูล user ที่ login อยู่

// เช็คว่าเป็น Admin หรือไม่
const isAdmin = computed(() => user.value?.profile?.role === 'admin')
const props = defineProps<Props>()

const showInvoice = ref(false)
const orderData = ref(props.order)

const openInvoice = () => {
  showInvoice.value = true
}

const closeInvoice = () => {
  showInvoice.value = false
}

watch(() => props.order, (newOrder) => {
  orderData.value = newOrder
}, { deep: true })
</script>

<style scoped>
.btn-generate-invoice {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.btn-generate-invoice:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.invoice-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #f3f4f6;
  overflow-y: auto;
}
</style>