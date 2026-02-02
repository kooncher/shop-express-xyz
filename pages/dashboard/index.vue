<template>
  <div class="dashboard-container">
    <div
      v-if="showMobileSidebar"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    ></div>

    <button @click="toggleMobileSidebar" class="mobile-menu-btn">
      <span class="hamburger-line"></span><span class="hamburger-line"></span
      ><span class="hamburger-line"></span>
    </button>

    <Sidebar
      :menu-items="menuItems"
      :user="userData"
      :is-mobile-open="showMobileSidebar"
      :is-collapsed="isSidebarCollapsed"
      @toggle="handleToggle"
      @close-mobile="closeMobileSidebar"
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
              ยินดีต้อนรับกลับมา, {{ user?.profile?.full_name ?? "ผู้ใช้งาน" }}!
            </p>
          </div>
          <button @click="handleLogout" class="logout-btn">
            🚪 ออกจากระบบ
          </button>
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

        <div class="card orders-card" v-if="!loading">
          <h2 class="card-title">คำสั่งซื้อล่าสุด</h2>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>รหัสคำสั่งซื้อ</th>
                  <th>ลูกค้า</th>
                  <th class="hide-mobile">ยอดรวม</th>
                  <th>สถานะ</th>
                  <th class="hide-mobile">วันที่</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="order in dashboardData?.recentOrders"
                  :key="order.id"
                >
                  <td class="font-semibold">{{ order.order_number }}</td>
                  <td>{{ order.customer_name }}</td>
                  <td class="hide-mobile">
                    ฿{{ order.total?.toLocaleString() }}
                  </td>
                  <td>
                    <span
                      :class="['badge', getStatusClass(order.payment_status)]"
                    >
                      {{ getStatusLabel(order.payment_status) }}
                    </span>
                  </td>
                  <td class="hide-mobile">
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
// --- Imports ---
import Barchart from "../components/Globalcomponents/Barchart.vue";

const { user, signOut } = useAuth();
const { getAllDashboardData } = useDashboard();

// --- State ---
const loading = ref(true);
const dashboardData = ref<any>(null);
const isSidebarCollapsed = ref(false);
const showMobileSidebar = ref(false);
const currentPage = ref("หน้าแรก");

// --- Computed Props (Professional Way) ---
const statsData = computed(() => ({
  ยอดขายวันนี้:
    "฿" + (dashboardData.value?.stats?.totalSales?.toLocaleString() ?? 0),
  คำสั่งซื้อใหม่: dashboardData.value?.stats?.newOrdersCount ?? 0,
  ลูกค้าใหม่: dashboardData.value?.stats?.newCustomersCount ?? 0,
  สินค้าคงเหลือ: dashboardData.value?.stats?.totalStock?.toLocaleString() ?? 0,
}));
// ใน Dashboard.vue
const isMobile = ref(false);

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 1024;
  if (!isMobile.value) {
    showMobileSidebar.value = false; // ปิด Mobile Sidebar อัตโนมัติเมื่อขยายจอ
  }
};

onMounted(() => {
  loadData();
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
const salesChartConfig = computed(() => ({
  type: "line" as const,
  // --- เพิ่มส่วนนี้เข้าไปครับ ---
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
  // -------------------------
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
        beginAtZero: true, // เพิ่มตัวนี้เพื่อให้แกน Y เริ่มที่ 0 เสมอ
        ticks: {
          callback: (value: any) => "฿" + value.toLocaleString(),
        },
      },
    },
  },
}));
const barChartConfig = computed(() => ({
  type: "bar" as const,
  data: {
    labels: dashboardData.value?.topProducts?.names || [],
    datasets: [
      {
        label: "ยอดขายรายสินค้า",
        data: dashboardData.value?.topProducts?.sales || [],
        backgroundColor: "#818cf8",
        borderRadius: 8,
      },
    ],
  },
  options: { responsive: true, maintainAspectRatio: false },
}));

const userData = computed(() => ({
  name: user.value?.profile?.full_name ?? "ผู้ใช้งาน",
  email: user.value?.email ?? "",
  avatar: "👤",
}));

// --- Actions ---
const loadData = async () => {
  loading.value = true;
  try {
    const { data } = await getAllDashboardData();
    dashboardData.value = data;
  } finally {
    loading.value = false;
  }
};

onMounted(loadData);

// --- Helpers ---
const formatDate = (d: string) =>
  d
    ? new Date(d).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
      })
    : "-";
const getStatusLabel = (s: string) =>
  ({ pending: "รอชำระ", paid: "ชำระแล้ว", completed: "สำเร็จ" })[s] || s;
const getStatusClass = (s: string) =>
  s === "paid" || s === "completed" || s === "ชำระแล้ว" ? "success" : "warning";
const handleToggle = (val: boolean) => (isSidebarCollapsed.value = val);
const toggleMobileSidebar = () =>
  (showMobileSidebar.value = !showMobileSidebar.value);
const closeMobileSidebar = () => (showMobileSidebar.value = false);
const handleLogout = () => signOut();

const menuItems = [
  { id: "home", label: "หน้าแรก", icon: "🏠" },
  { id: "products", label: "สินค้า", icon: "📦" },
  { id: "orders", label: "คำสั่งซื้อ", icon: "📋" },
  { id: "customers", label: "ลูกค้า", icon: "👥" },
  { id: "reports", label: "รายงาน", icon: "📊" },
  { id: "settings", label: "ตั้งค่า", icon: "⚙️" },
];
</script>

<style scoped>
/* เก็บ CSS เดิมของคุณไว้ได้เลย เพราะมันจัดการ Layout ได้ดีอยู่แล้ว */
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
.orders-card {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  margin-top: 1.5rem;
}
.table-container {
  overflow-x: auto;
  margin-top: 1rem;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th {
  padding: 1rem;
  text-align: left;
  color: #64748b;
  border-bottom: 2px solid #f1f5f9;
  font-size: 0.875rem;
}
.data-table td {
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}
.badge {
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.success {
  background: #dcfce7;
  color: #166534;
}
.badge.warning {
  background: #fef3c7;
  color: #92400e;
}
.font-semibold {
  font-weight: 600;
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
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  .main-content {
    margin-left: 0 !important;
  }
}

/* --- ส่วนเพิ่มเติมใน <style scoped> ของ Dashboard --- */

/* ปุ่ม Mobile Menu ให้ดู Premium ขึ้น */
.mobile-menu-btn {
  display: none; /* ซ่อนใน Desktop */
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

/* Overlay สำหรับปิด Sidebar */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

/* ปรับปรุง Responsive */
@media (max-width: 1024px) {
  .main-content {
    margin-left: 0 !important;
    padding-top: 4rem; /* เว้นที่ให้ Header ในมือถือ */
  }

  .mobile-menu-btn {
    display: flex; /* แสดงในมือถือ */
  }

  .content-wrapper {
    padding: 1rem;
  }

  /* จัดการตารางในมือถือ (โชว์เฉพาะที่สำคัญ) */
  .hide-mobile {
    display: none !important;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .logout-btn {
    width: 100%; /* ปุ่ม Logout เต็มจอในมือถือ */
    text-align: center;
  }
}
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px); /* เพิ่มความเบลอให้ฉากหลังดูแพง */
  z-index: 998; /* อยู่ใต้ Sidebar (1000) แต่อยู่บน Content */
  transition: opacity 0.3s ease;
}

@media (max-width: 768px) {
  /* 1. ซ่อนคอลัมน์ที่ความสำคัญน้อยในมือถือ */
  .hide-mobile {
    display: none !important;
  }

  /* 2. ปรับตัวอักษรในตารางให้เล็กลงแต่ยังอ่านง่าย */
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }

  /* 3. เน้นคอลัมน์สำคัญ (เช่น รหัสคำสั่งซื้อ) */
  .font-semibold {
    font-size: 0.85rem;
    color: #4f46e5; /* เพิ่มสีให้ดูเด่นขึ้นในจอเล็ก */
  }

  /* 4. ปรับ Badge ให้เล็กลง */
  .badge {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
}
</style>
