<template>
  <div class="dashboard-container">
    <div
      v-if="showMobileSidebar"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <button @click="toggleMobileSidebar" class="mobile-menu-btn">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <Sidebar
      :menu-items="menuItems"
      :user="userData"
      :is-mobile-open="showMobileSidebar"
      :is-collapsed="isSidebarCollapsed"
      @toggle="handleToggle"
      @close-mobile="closeMobileSidebar"
      @item-click="handleMenuClick"
    />

    <main
      class="main-content"
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    >
      <div class="content-wrapper">
        <div class="page-header">
          <div class="header-text">
            <h1 class="page-title">{{ currentPage }}</h1>
            <p class="page-subtitle">
              ยินดีต้อนรับกลับมา, {{ userData.name }}!
            </p>
          </div>
          <!-- <button @click="handleLogout" class="logout-btn">
            🚪 ออกจากระบบ
          </button> -->
        </div>

        <div v-if="loading" class="stats-grid">
          <div
            v-for="i in 4"
            :key="i"
            class="stat-card skeleton-pulse"
            style="height: 120px"
          ></div>
        </div>
        <div v-else class="stats-grid">
          <div v-for="(val, label) in statsData" :key="label" class="stat-card">
            <p class="stat-label">{{ label }}</p>
            <p class="stat-value">{{ val }}</p>
          </div>
        </div>

        <div class="charts-grid">
          <div class="card chart-card">
            <h2 class="card-title">ยอดขาย 7 วันล่าสุด</h2>
            <Barchart v-if="!loading" :config="salesChartConfig" />
          </div>
          <div class="card chart-card">
            <h2 class="card-title">สินค้าขายดี Top 5</h2>
            <Barchart v-if="!loading" :config="barChartConfig" />
          </div>
        </div>

        <div class="card orders-card">
  <h2 class="card-title">คำสั่งซื้อล่าสุด</h2>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>เลขที่</th>
          <th>ลูกค้า</th>
          <th>ยอดรวม</th>
          <th>สถานะ</th>
          <th>วันที่</th>
        </tr>
      </thead>
 <tbody>
  <tr v-if="dashboardData?.recentOrders.length === 0">
    <td colspan="5" class="empty-message">ยังไม่มีคำสั่งซื้อ</td>
  </tr>
  <tr v-else v-for="order in dashboardData?.recentOrders" :key="order.id" class="mobile-order-card">
    <td data-label="เลขที่" class="order-number-cell font-semibold">
      {{ order.order_number }}
    </td>
    <td data-label="ลูกค้า">{{ order.customer_name }}</td>
    <td data-label="ยอดรวม">
      <span class="price-text font-semibold">฿{{ formatNumber(order.total) }}</span>
    </td>
    <td data-label="สถานะ">
      <span :class="['badge', getStatusClass(order.status)]">
        {{ getStatusLabel(order.status) }}
      </span>
    </td>
    <td data-label="วันที่" class="date-cell">
      {{ formatDate(order.created_at) }}
    </td>
  </tr>
</tbody>
    </table>
  </div>
</div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import Barchart from "@/components/GlobalComponents/Barchart.vue";

// 1. ตั้งค่า Page & Middleware
definePageMeta({
  middleware: "auth",
});

// 2. ดึง Utilities
const { user } = useAuth();
const { getAllDashboardData } = useDashboard();
const { $supabase } = useNuxtApp();
const roleCookie = useCookie("user-role");

// 3. สถานะหลัก (State)
const loading = ref(true);
const dashboardData = ref<any>(null);
const isSidebarCollapsed = ref(false);
const showMobileSidebar = ref(false);
const isMobile = ref(false);
const currentPage = ref("หน้าแรก");

// 4. ข้อมูลผู้ใช้ (Computed เพื่อความเสถียรตอนรีเฟรช)
const userData = computed(() => ({
  name:
    user.value?.user_metadata?.full_name ??
    user.value?.profile?.full_name ??
    "ผู้ใช้งาน",
  email: user.value?.email ?? "",
  avatar: "👤",
  role: roleCookie.value || "customer",
}));

// 5. เมนูที่มีการกำหนด Role
const menuItems = [
  { id: "home", label: "หน้าแรก", icon: "🏠", roles: ["admin"] },
  { id: "products", label: "สินค้า", icon: "📦", roles: ["admin"] },
  { id: "orders", label: "คำสั่งซื้อ", icon: "📋", roles: ["admin"] },
  { id: "customers", label: "ลูกค้า", icon: "👥", roles: ["admin"] },
  { id: "reports", label: "รายงาน", icon: "📊", roles: ["admin"] },
  {
    id: "settings",
    label: "ตั้งค่า",
    icon: "⚙️",
    roles: ["admin", "customer"],
  },
];

// 6. ข้อมูลสถิติ (Computed จาก Dashboard Data)
const statsData = computed(() => ({
  ยอดขายวันนี้:
    "฿" + (dashboardData.value?.stats?.totalSales?.toLocaleString() ?? 0),
  คำสั่งซื้อใหม่: dashboardData.value?.stats?.newOrdersCount ?? 0,
  ลูกค้าใหม่: dashboardData.value?.stats?.newCustomersCount ?? 0,
  สินค้าคงเหลือ: dashboardData.value?.stats?.totalStock?.toLocaleString() ?? 0,
}));

// 7. ฟังก์ชันโหลดข้อมูลและจัดการหน้าจอ
const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await getAllDashboardData();
    dashboardData.value = data;
  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    loading.value = false;
  }
};

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024;
  if (!isMobile.value) showMobileSidebar.value = false;
};

const handleLogout = async () => {
  const { $supabase } = useNuxtApp(); // 👈 ต้องมีบรรทัดนี้เพื่อดึงตัวจัดการ Supabase มา
  const roleCookie = useCookie("user-role");

  try {
    // 1. สั่ง SignOut ไปที่ Server (ใช้เวลาแป๊บนึง)
    await $supabase.auth.signOut();
  } catch (err) {
    console.error("Supabase SignOut Error:", err);
  } finally {
    // 2. ไม่ว่าข้างบนจะพังหรือไม่ เราต้องล้างค่าในเครื่องทิ้งให้หมด
    roleCookie.value = null;

    // 3. ใช้ navigateTo แบบ 'replace' เพื่อไม่ให้กดปุ่ม Back กลับมาหน้านี้ได้อีก
    await navigateTo("/login", { replace: true });

    // 4. บังคับรีเฟรช 1 ครั้งเพื่อเคลียร์ State ที่ค้างอยู่ในหน่วยความจำ (Option เสริมเพื่อความชัวร์)
    window.location.reload();
  }
};
// 8. Lifecycle Hooks (รวมศูนย์ที่เดียว)
onMounted(async () => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  await loadData();
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});

// 9. UI Helpers (คงเดิมทั้งหมด)
const handleToggle = (val: boolean) => (isSidebarCollapsed.value = val);
const toggleMobileSidebar = () =>
  (showMobileSidebar.value = !showMobileSidebar.value);
const closeMobileSidebar = () => (showMobileSidebar.value = false);

const handleMenuClick = (item: any) => {
  if (item.id === "home") navigateTo("/dashboard");
  if (item.id === "products") navigateTo("/products");
  if (item.id === "shop") navigateTo("/shop");
  closeMobileSidebar();
};

const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      })
    : "-";

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ", confirmed: "ยืนยันแล้ว", processing: "กำลังเตรียมสินค้า",
    shipping: "กำลังจัดส่ง", completed: "สำเร็จแล้ว", cancelled: "ยกเลิก",
  };
  return labels[status] || status;
};
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "warning", confirmed: "info", processing: "info",
    shipping: "primary", completed: "success", cancelled: "danger",
  };
  return classes[status] || "secondary";
};

// 10. Chart Configs (คงเดิมทั้งหมด)
const salesChartConfig = computed(() => ({
  type: "line" as const,
  data: {
    labels: dashboardData.value?.chartData?.dates || [],
    datasets: [
      {
        label: "ยอดขาย",
        data: dashboardData.value?.chartData?.sales || [],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => `ยอดขาย: ฿${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => "฿" + value.toLocaleString(),
        },
      },
    },
  },
}));
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num || 0);
};

// กราฟแท่ง: สินค้าขายดี Top 5 (ดึงตามโครงสร้างใหม่จาก useDashboard)
const barChartConfig = computed(() => {
  const topProducts = dashboardData.value?.topProducts;

  // ดึง names และ sales ตามที่ประกาศไว้ใน productMap.map(...)
  const labels = topProducts?.names || [];
  const values = topProducts?.sales || [];

  return {
    type: "bar" as const,
    data: {
      labels: labels,
      datasets: [
        {
          label: "ยอดขายรวม (บาท)",
          data: values,
          backgroundColor: "#818cf8",
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context: any) => `ยอดขาย: ฿${context.raw.toLocaleString()}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: any) => "฿" + value.toLocaleString(),
          },
        },
      },
    },
  };
});
</script>

<style scoped>
/* CSS ทุกอย่างเหมือนเดิมเป๊ะครับ */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin 0.3s ease;
  min-width: 0;
}
.main-content.sidebar-collapsed {
  margin-left: 80px;
}
.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.logout-btn {
  padding: 0.6rem 1.2rem;
  background: #ef4444;
  color: white;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
}
.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.chart-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  height: 450px;
  display: flex;
  flex-direction: column;
}
.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.5rem;
}
/* คอนเทนเนอร์หลักของตาราง */
.orders-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1.25rem;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
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

.text-center {
  text-align: center;
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

.skeleton-pulse {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Mobile Responsive */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  border: none;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
  z-index: 1001;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.hamburger-line {
  width: 24px;
  height: 2px;
  background: white;
  border-radius: 2px;
}
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
  }
  .mobile-menu-btn {
    display: flex;
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .hide-mobile {
    display: none !important;
  }
}

/* --- แก้ปัญหาการซ้อนทับและตาราง --- */
.desktop-only-view {
  display: block;
}
.mobile-only-view {
  display: none;
}

@media (max-width: 768px) {
  /* 1. บังคับให้ตารางหายไป เปลี่ยนเป็นกล่อง Card */
  .data-table, .data-table tbody, .data-table tr, .data-table td {
    display: block !important; /* บังคับเป็นบล็อกเพื่อให้กินพื้นที่เต็มบรรทัด */
    width: 100%;
  }

  .data-table thead {
    display: none; /* ซ่อนหัวตารางแบบเดิม */
  }

  /* 2. จัดการตัว Card */
  .data-table tr.mobile-order-card {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 12px;
    margin-bottom: 1rem;
    padding: 0.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
  }

  /* 3. จัดการบรรทัดข้อมูลใน Card */
  .data-table td {
    display: flex !important; /* ใช้ flex เพื่อแยก Label กับ Value */
    justify-content: space-between; /* ✨ ดัน Label ไปซ้ายสุด Value ไปขวาสุด */
    align-items: center;
    padding: 0.8rem 1rem !important;
    border-bottom: 1px solid #f8fafc;
    text-align: right;
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  /* 4. จัดการ Label ฝั่งซ้าย */
  .data-table td::before {
    content: attr(data-label);
    font-weight: 500;
    color: #64748b; /* สีเทาเข้มขึ้นนิดนึงให้อ่านง่าย */
    flex-shrink: 0; /* ป้องกัน Label ถูกบีบ */
    margin-right: 1rem;
    text-align: left;
  }

  /* 5. ปรับตัวเลข Order ให้เด่น (ส่วนที่เป็น Header ของ Card) */
  .order-number-cell {
    background: #f8faff;
    border-radius: 8px 8px 0 0;
    color: #4f46e5 !important;
    font-weight: 700 !important;
  }
}
/* แก้ไขปัญหา Header เบียดกับ Stats ในรูป image_902c34 */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 1rem !important;
    padding-bottom: 5rem !important; /* เว้นที่ให้ปุ่มเมนูด้านล่าง */
  }

  .page-header {
    margin-bottom: 1.5rem;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
