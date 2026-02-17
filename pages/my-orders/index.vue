<template>
  <div class="dashboard-container">
    <button class="floating-hamburger-btn" @click="toggleMobileSidebar">
      <div class="hamburger-icon-wrapper">
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
      </div>
    </button>

    <!-- Mobile Overlay -->
    <div
      v-if="showMobileSidebar"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <Sidebar
      :menu-items="menuItems"
      :user="userData"
      :is-mobile-open="showMobileSidebar"
      @item-click="handleMenuClick"
      @toggle="handleToggle"
      @close-mobile="closeMobileSidebar"
    />

    <main
      class="main-content"
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    >
      <div class="content-wrapper">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">คำสั่งซื้อของฉัน</h1>
            <p class="page-subtitle">รายการคำสั่งซื้อที่คุณเคยสั่งซื้อไว้</p>
          </div>

          <!-- <button @click="openCreateModal" class="btn-primary">
            <span>➕</span>
            <span>สร้างคำสั่งซื้อ</span>
          </button> -->
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
              <p class="stat-value">
                {{ getOrdersByStatus("pending").length }}
              </p>
            </div>
            <div class="stat-icon pending">⏳</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">กำลังจัดส่ง</p>
              <p class="stat-value">
                {{ getOrdersByStatus("shipping").length }}
              </p>
            </div>
            <div class="stat-icon shipping">🚚</div>
          </div>

          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">สำเร็จแล้ว</p>
              <p class="stat-value">
                {{ getOrdersByStatus("completed").length }}
              </p>
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

            <select
              v-model="filterStatus"
              @change="loadOrders"
              class="filter-select"
            >
              <option value="">ทุกสถานะ</option>
              <option value="pending">รอดำเนินการ</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="processing">กำลังเตรียมสินค้า</option>
              <option value="shipping">กำลังจัดส่ง</option>
              <option value="completed">สำเร็จแล้ว</option>
              <option value="cancelled">ยกเลิก</option>
            </select>

            <select
              v-model="filterPaymentStatus"
              @change="loadOrders"
              class="filter-select"
            >
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
            <!-- <button @click="openCreateModal" class="btn-primary">
              สร้างคำสั่งซื้อแรก
            </button> -->
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>เลขที่คำสั่งซื้อ</th>
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
                  <td data-label="เลขที่" class="font-semibold">
                    {{ order.order_number }}
                  </td>
                  <td data-label="ลูกค้า">{{ order.customer_name }}</td>
                  <td data-label="เบอร์โทร" class="text-muted">
                    {{ order.customer_phone || "-" }}
                  </td>
                  <td data-label="ยอดรวม" class="font-semibold">
                    ฿{{ formatNumber(order.total) }}
                  </td>
                  <td data-label="สถานะ">
                    <span :class="['badge', getStatusClass(order.status)]">
                      {{ getStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td data-label="การชำระเงิน">
                    <span
                      :class="[
                        'badge',
                        getPaymentStatusClass(order.payment_status),
                      ]"
                    >
                      {{ getPaymentStatusLabel(order.payment_status) }}
                    </span>
                  </td>
                  <td data-label="วันที่สั่ง" class="text-muted">
                    {{ formatDate(order.created_at) }}
                  </td>
                  <td data-label="จัดการ">
                    <div class="action-buttons">
                      <button
                        @click="viewOrder(order)"
                        class="btn-icon btn-view"
                        title="ดูรายละเอียด"
                      >
                        👁️
                      </button>

                      <button
                        v-if="
                          order.payment_status === 'unpaid' &&
                          order.status !== 'cancelled'
                        "
                        @click="payOrder(order)"
                        class="btn-pay-now"
                      >
                        💳 ชำระเงิน
                      </button>

                      <button
                        v-if="
                          order.status === 'pending' &&
                          order.payment_status === 'unpaid'
                        "
                        @click="confirmCancel(order)"
                        class="btn-icon btn-delete"
                        title="ยกเลิกคำสั่งซื้อ"
                      >
                        🚫
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <PaymentModal
              v-if="showPaymentModal"
              :order="selectedOrderForPayment"
              @close="showPaymentModal = false"
              @success="handlePaymentSuccess(selectedOrderForPayment?.id)"
            />
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
      title="ยืนยันการยกเลิกคำสั่งซื้อ"
      :message="`คุณต้องการยกเลิกคำสั่งซื้อ &quot;${orderToDelete?.order_number}&quot; ใช่หรือไม่?`"
      @confirm="handleCancelOrder"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import OrderModal from "~/components/Orders/OrderModal.vue";
import OrderDetailModal from "~/components/Orders/OrderDetailModal.vue";
import ConfirmModal from "~/components/Orders/ConfirmModal.vue";
import PaymentModal from "~/components/Shops/PaymentModal.vue";

definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();
const { getOrders, deleteOrder, updateOrderStatus, updatePaymentStatus } =
  useOrders();
const loading = ref(true);
const orders = ref([]);
const searchQuery = ref("");
const filterStatus = ref("");
const filterPaymentStatus = ref("");
const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);
const showPaymentModal = ref(false);
const selectedOrderForPayment = ref(null);

// Modal states - ส่วนที่หายไป
const showModal = ref(false);
const showDetailModal = ref(false);
const selectedOrder = ref(null);
const showDeleteConfirm = ref(false);
const orderToDelete = ref(null);

const menuItems = [
  { id: "home", label: "หน้าแรก", icon: "🏠", roles: ["admin"] },
  { id: "shop", label: "ร้านค้า", icon: "🛒", roles: ["customer"] },
  {
    id: "myorders",
    label: "คำสั่งซื้อของฉัน",
    icon: "📋",
    roles: ["customer"],
  },
  { id: "settings", label: "ตั้งค่า", icon: "⚙️", roles: ["customer"] },
];

const userData = computed(() => ({
  name: user.value?.profile?.full_name || "ผู้ใช้งาน",
  email: user.value?.email || "",
  avatar: "👤",
}));

// Load orders
const loadOrders = async () => {
  loading.value = true;

  // 1. ตรวจสอบก่อนว่ามี User Login อยู่จริงไหม (Safety First)
  if (!user.value) {
    loading.value = false;
    return;
  }

  const filters: any = {};
  if (filterStatus.value) filters.status = filterStatus.value;
  if (filterPaymentStatus.value)
    filters.payment_status = filterPaymentStatus.value;
  if (searchQuery.value) filters.search = searchQuery.value;

  // 2. ส่ง user_id (หรือ id ของผู้ใช้) เข้าไปในฟังก์ชัน getOrders
  // หมายเหตุ: คุณต้องไปปรับที่ useOrders ให้รับค่า userId ไปกรองใน .eq('user_id', userId) ด้วยครับ
  const { data, error } = await getOrders({
    ...filters,
    userId: user.value.id, // ส่ง ID ของคนที่ Login อยู่ไป
  });

  if (!error && data) {
    orders.value = data;
  }

  loading.value = false;
};
const payOrder = (order) => {
  selectedOrderForPayment.value = order;
  showPaymentModal.value = true;
};
// ฟังก์ชันสำหรับกดยกเลิก
const confirmCancel = (order: any) => {
  // ใช้ ConfirmModal เดิมที่คุณมีอยู่แล้ว
  orderToDelete.value = order;
  showDeleteConfirm.value = true;
};
// ในหน้า my-orders.vue
const handlePaymentSuccess = async (orderId: string | undefined) => {
  if (!orderId) return; // เช็คเพื่อความชัวร์อีกรอบ

  try {
    const { error } = await updatePaymentStatus(orderId, "paid");

    if (error) throw error;

    // 2. แสดง Notification (ถ้ามี)
    // toast.success('ชำระเงินเรียบร้อยแล้ว');

    // 3. โหลดข้อมูลใหม่เพื่ออัปเดต UI ในตาราง
    await loadOrders();
  } catch (err) {
    console.error("Update payment failed:", err);
    alert("เกิดข้อผิดพลาดในการอัปเดตสถานะการชำระเงิน");
  }
};
const handleCancelOrder = async () => {
  if (!orderToDelete.value) return;

  loading.value = true;
  try {
    // ใช้ฟังก์ชันจาก useOrders ที่คุณเตรียมไว้แล้ว
    const { error } = await updateOrderStatus(
      orderToDelete.value.id,
      "cancelled",
    );

    if (!error) {
      await loadOrders(); // โหลดข้อมูลใหม่เพื่ออัปเดต UI ให้ Badge กลายเป็นสีแดง (ยกเลิก)
      showDeleteConfirm.value = false; // ปิด Modal
      orderToDelete.value = null; // ล้างค่า
    } else {
      throw error;
    }
  } catch (err) {
    console.error("Error cancelling order:", err);
    alert("ไม่สามารถยกเลิกคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง");
  } finally {
    loading.value = false;
  }
};
// Mobile Sidebar Controls
const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value;
};

const closeMobileSidebar = () => {
  showMobileSidebar.value = false;
};

const handleToggle = (isCollapsed) => {
  isSidebarCollapsed.value = isCollapsed;
};

// Search handler with debounce - ส่วนที่หายไป
let searchTimeout: any;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadOrders();
  }, 500);
};

// Get orders by status
const getOrdersByStatus = (status: string) => {
  return orders.value.filter((order: any) => order.status === status);
};

// Modal handlers - ส่วนที่หายไป
const openCreateModal = () => {
  selectedOrder.value = null;
  showModal.value = true;
};

const openEditModal = (order: any) => {
  selectedOrder.value = { ...order };
  showModal.value = true;
};

const viewOrder = (order: any) => {
  selectedOrder.value = order;
  showDetailModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedOrder.value = null;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedOrder.value = null;
};

const handleSave = async () => {
  closeModal();
  await loadOrders();
};

const handleUpdateStatus = async () => {
  await loadOrders();
};

const confirmDelete = (order: any) => {
  orderToDelete.value = order;
  showDeleteConfirm.value = true;
};

const handleDelete = async () => {
  if (orderToDelete.value) {
    const { error } = await deleteOrder(orderToDelete.value.id);

    if (!error) {
      await loadOrders();
    }
  }

  showDeleteConfirm.value = false;
  orderToDelete.value = null;
};

// Get status class
const getStatusClass = (status: string) => {
  const classes: any = {
    pending: "warning",
    confirmed: "info",
    processing: "info",
    shipping: "primary",
    completed: "success",
    cancelled: "danger",
  };
  return classes[status] || "secondary";
};

// Get status label
const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: "รอดำเนินการ",
    confirmed: "ยืนยันแล้ว",
    processing: "กำลังเตรียมสินค้า",
    shipping: "กำลังจัดส่ง",
    completed: "สำเร็จแล้ว",
    cancelled: "ยกเลิก",
  };
  return labels[status] || status;
};

// Get payment status class
const getPaymentStatusClass = (status: string) => {
  const classes: any = {
    unpaid: "warning",
    paid: "success",
    refunded: "danger",
  };
  return classes[status] || "secondary";
};

// Get payment status label
const getPaymentStatusLabel = (status: string) => {
  const labels: any = {
    unpaid: "ยังไม่ชำระ",
    paid: "ชำระแล้ว",
    refunded: "คืนเงินแล้ว",
  };
  return labels[status] || status;
};

// Format number
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Handle menu click
const handleMenuClick = (item: any) => {
  if (item.id === "home") {
    navigateTo("/dashboard");
  } else if (item.id === "products") {
    navigateTo("/products");
  } else if (item.id === "orders") {
    navigateTo("/orders");
  } else if (item.id === "customers") {
    navigateTo("/customers");
  } else if (item.id === "reports") {
    navigateTo("/reports");
  } else if (item.id === "settings") {
    navigateTo("/settings");
  }
};

// Initialize
onMounted(async () => {
  await loadOrders();
});
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
@media (max-width: 1024px) {
  /* ซ่อนหัวตาราง */
  .data-table thead {
    display: none;
  }

  /* ปรับแถวตารางให้กลายเป็นแผ่นการ์ด */
  .data-table tr {
    display: flex;
    flex-direction: column;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1rem;
    margin-bottom: 1.25rem;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  /* จัดการช่องข้อมูล (Label อยู่ซ้าย ข้อมูลอยู่ขวา) */
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0;
    border-bottom: 1px solid #f3f4f6;
    width: 100%;
    text-align: right;
  }

  /* ใส่หัวข้อกำกับจาก data-label */
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #6b7280;
    font-size: 0.85rem;
    text-align: left;
  }

  /* ปรับแต่งช่อง "เลขที่คำสั่งซื้อ" ให้เด่นเป็นพิเศษ */
  .data-table td[data-label="เลขที่"] {
    background: #f8fafc;
    margin: -1rem -1rem 0.5rem -1rem;
    padding: 1rem;
    border-radius: 1rem 1rem 0 0;
    border-bottom: 2px solid #e2e8f0;
  }

  /* ช่อง "จัดการ" ไม่ต้องมีเส้นคั่น */
  .data-table td[data-label="จัดการ"] {
    border-bottom: none;
    padding-top: 1rem;
    justify-content: center; /* ปุ่มกดอยู่ตรงกลางเพื่อให้กดง่าย */
  }

  .data-table td[data-label="จัดการ"]::before {
    display: none;
  }

  .action-buttons {
    width: 100%;
    justify-content: space-around;
    gap: 1rem;
  }

  .btn-icon {
    flex: 1; /* ขยายปุ่มให้ใหญ่ขึ้นในมือถือ กดง่ายกว่า */
    height: 44px;
  }
}

/* ปรับปรุงส่วน Header และ Stats ในมือถือ */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
    padding-top: 5rem; /* เผื่อพื้นที่ให้ปุ่ม Hamburger */
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr; /* สถิติโชว์แบบ 2 คอลัมน์คู่กันดูสวยกว่า */
    gap: 0.75rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}

/* --- Floating Hamburger Button (ม่วง Indigo เหมือนในรูป) --- */
.floating-hamburger-btn {
  display: none; /* เริ่มต้นซ่อนไว้ก่อน */
  position: fixed;
  bottom: 25px; /* ระยะจากขอบล่าง */
  right: 25px; /* ระยะจากขอบขวา */
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 50%;
  border: none;
  z-index: 2001; /* ให้อยู่เหนือทุกอย่าง */
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.4);
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.floating-hamburger-btn:active {
  transform: scale(0.9);
}

/* เส้น Hamburger */
.hamburger-icon-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hamburger-icon-wrapper span {
  display: block;
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: 0.3s ease;
}

/* Animation เส้นเมื่อเปิดเมนู */
.line-open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.line-open:nth-child(2) {
  opacity: 0;
}
.line-open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

/* --- Media Query: แสดงเฉพาะบนมือถือ --- */
@media (max-width: 1024px) {
  .floating-hamburger-btn {
    display: flex; /* แสดงปุ่มเฉพาะหน้าจอเล็ก */
  }

  /* แก้ไขส่วนที่เละ: เคลียร์ Margin ของหน้าหลักออก */
  .main-content {
    margin-left: 0 !important;
    padding: 15px !important;
    padding-top: 20px !important; /* เว้นที่ให้ Header */
  }

  /* ป้องกันตารางล้น (เละแบบในรูป image_f3be03) */
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}

/* Container สำหรับจัดกลุ่มปุ่ม */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px; /* ระยะห่างระหว่างปุ่ม */
}

/* สไตล์ปุ่มพื้นฐาน (Shared) */
.btn-icon,
.btn-pay-now {
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ปุ่มดูรายละเอียด (แว่นขยาย/รูปตา) */
.btn-view {
  background-color: #f1f5f9;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}
.btn-view:hover {
  background-color: #e2e8f0;
  color: #1e293b;
  transform: translateY(-1px);
}

/* 💳 ปุ่มชำระเงิน (โดดเด่นที่สุด) */
.btn-pay-now {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 0 16px;
  height: 36px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  gap: 6px;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}
.btn-pay-now:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 6px 12px -2px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}
.btn-pay-now:active {
  transform: translateY(0);
}

/* 🚫 ปุ่มยกเลิก (สีแดงอ่อน) */
.btn-delete {
  background-color: #fff1f2;
  color: #e11d48;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}
.btn-delete:hover {
  background-color: #ffe4e6;
  color: #be123c;
  transform: translateY(-1px);
}

/* ปรับขนาด Emoji ในปุ่ม icon ให้พอดี */
.btn-icon {
  font-size: 1.1rem;
}
</style>
