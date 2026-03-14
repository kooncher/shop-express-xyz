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
            <h1 class="page-title">รายงานและสถิติ</h1>
            <p class="page-subtitle">ภาพรวมธุรกิจและการวิเคราะห์ข้อมูล</p>
          </div>

          <div class="date-filter">
            <button
              @click="exportToExcel"
              class="btn-export"
              :disabled="loading"
            >
              <span>📊</span>
              <span>ส่งออก Excel</span>
            </button>
            <button @click="loadData" class="btn-refresh">
              <span>🔄</span>
              <span>รีเฟรช</span>
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>กำลังโหลดข้อมูล...</p>
        </div>

        <!-- Main Stats -->
        <div v-else>
          <div class="stats-grid">
            <div class="stat-card revenue">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <p class="stat-label">รายได้รวม</p>
                <p class="stat-value">
                  ฿{{ formatNumber(stats.totalRevenue) }}
                </p>
                <p class="stat-change positive">จากคำสั่งซื้อที่สำเร็จ</p>
              </div>
            </div>

            <div class="stat-card orders">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <p class="stat-label">คำสั่งซื้อทั้งหมด</p>
                <p class="stat-value">{{ stats.totalOrders }}</p>
                <p class="stat-change">{{ stats.completedOrders }} สำเร็จ</p>
              </div>
            </div>

            <div class="stat-card products">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <p class="stat-label">สินค้าทั้งหมด</p>
                <p class="stat-value">{{ stats.totalProducts }}</p>
                <p
                  class="stat-change warning"
                  v-if="stats.lowStockProducts > 0"
                >
                  {{ stats.lowStockProducts }} ใกล้หมด
                </p>
                <p class="stat-change" v-else>สต็อกปกติ</p>
              </div>
            </div>

            <div class="stat-card customers">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <p class="stat-label">ลูกค้าทั้งหมด</p>
                <p class="stat-value">{{ stats.totalCustomers }}</p>
                <p class="stat-change">
                  {{ stats.activeCustomers }} ที่ซื้อแล้ว
                </p>
              </div>
            </div>
          </div>

          <!-- Sales Chart -->
          <div class="card">
            <h2 class="card-title">ยอดขาย 7 วันล่าสุด</h2>
            <div class="chart-container">
              <div class="simple-chart">
                <div
                  v-for="(item, index) in salesData"
                  :key="index"
                  class="chart-bar-wrapper"
                >
                  <div class="chart-bar">
                    <div
                      class="chart-bar-fill"
                      :style="{ height: getBarHeight(item.total) + '%' }"
                    >
                      <span class="bar-value"
                        >฿{{ formatShortNumber(item.total) }}</span
                      >
                    </div>
                  </div>
                  <span class="chart-label">{{
                    formatChartDate(item.date)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="two-column-layout">
            <!-- Top Products -->
            <div class="card">
              <h2 class="card-title">สินค้าขายดี Top 5</h2>
              <div class="top-products-list">
                <template v-if="topProductsDisplay.length > 0">
                  <div
                    v-for="(item, index) in topProductsDisplay"
                    :key="index"
                    class="top-product-item"
                  >
                    <div class="product-info">
                      <div class="product-rank">{{ index + 1 }}</div>
                      <span class="product-name">{{ item.name }}</span>
                    </div>

                    <div class="product-stats">
                      <span class="product-count">{{
                        item.count.toLocaleString()
                      }}</span>
                      <span class="product-label">ชิ้น</span>
                    </div>
                  </div>
                </template>
                <div v-else class="text-center py-10 text-gray-400">
                  ยังไม่มีข้อมูลการขาย
                </div>
              </div>
            </div>

            <!-- Order Status -->
            <div class="card">
              <h2 class="card-title">สถานะคำสั่งซื้อ</h2>
              <div class="status-list">
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot pending"></span>
                    <span class="status-label">รอดำเนินการ</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.pending
                  }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot confirmed"></span>
                    <span class="status-label">ยืนยันแล้ว</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.confirmed
                  }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot processing"></span>
                    <span class="status-label">กำลังเตรียม</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.processing
                  }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot shipping"></span>
                    <span class="status-label">กำลังจัดส่ง</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.shipped
                  }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot completed"></span>
                    <span class="status-label">สำเร็จแล้ว</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.completed
                  }}</span>
                </div>
                <div class="status-item">
                  <div class="status-info">
                    <span class="status-dot cancelled"></span>
                    <span class="status-label">ยกเลิก</span>
                  </div>
                  <span class="status-count">{{
                    orderStatusCounts.cancelled
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Orders -->
        <div class="card">
  <div class="card-header-flex">
    <h2 class="card-title">📅 สรุปยอดขายรายวัน (ย้อนหลัง)</h2>
  </div>
  <div class="table-container">
    <table class="data-table">
      <thead>
        <tr>
          <th>วันที่</th>
          <th>จำนวนออเดอร์</th>
          <th>ยอดขายรวม</th>
          <th>ค่าเฉลี่ยต่อออเดอร์</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="day in dailyReportData" :key="day.date">
          <td data-label="วันที่" class="font-semibold">{{ formatDate(day.date) }}</td>
          <td data-label="จำนวนออเดอร์">{{ day.orderCount }} รายการ</td>
          <td data-label="ยอดขายรวม" class="font-bold text-indigo-600">
            ฿{{ formatNumber(day.totalAmount) }}
          </td>
          <td data-label="เฉลี่ย/บิล" class="text-muted">
            ฿{{ formatNumber(day.totalAmount / day.orderCount) }}
          </td>
        </tr>
        <tr v-if="dailyReportData.length === 0">
          <td colspan="4" class="empty-message">ไม่พบข้อมูลสรุปยอดขาย</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import * as XLSX from "xlsx";

definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();
// ดึง Composable มาใช้
const { getRecentSales, getTopProducts, getRecentOrders } = useReports();

// --- 1. State Management ---
const loading = ref(true);
const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);

const salesData = ref<any[]>([]);
const recentOrders = ref<any[]>([]);
const productsCount = ref(0);
const lowStockCount = ref(0);
// ตัวแปรสำหรับเก็บข้อมูลสินค้าขายดีจาก API
const topProductsRaw = ref<any>(null);

// --- 2. Computed Properties (Logic อิงตาม Data จริง) ---

// คำนวณ Stats ด้านบนจากออเดอร์ล่าสุด
const stats = computed(() => {
  const orders = recentOrders.value || [];

  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + (Number(order.total) || 0), 0);

  const completed = orders.filter((o) => o.status === "completed").length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    completedOrders: completed,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalProducts: productsCount.value,
    lowStockProducts: lowStockCount.value,
    totalCustomers: new Set(orders.map((o) => o.customer_name)).size,
    activeCustomers: completed,
  };
});

// นับสถานะคำสั่งซื้อ (ฝั่งขวา)
const orderStatusCounts = computed(() => {
  const orders = recentOrders.value || [];

  // 1. กำหนด Initial State และใช้ Type ให้ถูกต้อง
  const initialCounts: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    completed: 0,
    cancelled: 0,
  };

  // 2. ใช้ reduce เพื่อจบงานในลูปเดียว
  return orders.reduce((acc, { status }) => {
    if (status in acc) {
      acc[status]++;
    }
    return acc;
  }, { ...initialCounts }); // ใช้ Spread เพื่อไม่ให้ค่าตั้งต้นเพี้ยนเมื่อ Re-compute
});

// แปลงข้อมูลสินค้าขายดีให้พร้อมแสดงผล (ฝั่งซ้าย)
const topProductsDisplay = computed(() => {
  const data = topProductsRaw.value;

  // เช็คว่าถ้า data ไม่มีค่า หรือไม่ใช่ Array ให้คืนค่าว่าง
  if (!data || !Array.isArray(data)) {
    return [];
  }

  // Map ข้อมูลตามโครงสร้างที่เห็นใน Log (ใช้ quantity เป็นตัวนับยอดขาย)
  return data.map((item: any) => ({
    name: item.name || "ไม่ระบุชื่อสินค้า",
    count: item.quantity || 0,
    revenue: item.revenue || 0,
  }));
});
// --- 3. Data Loading ---
const loadData = async () => {
  loading.value = true;
  try {
    // ยิง API พร้อมกันเพื่อความเร็ว
    const [ordersRes, topRes, salesRes] = await Promise.all([
      getRecentOrders(),
      getTopProducts(),
      getRecentSales(),
    ]);

    if (ordersRes.data) recentOrders.value = ordersRes.data;
    if (topRes.data) topProductsRaw.value = topRes.data;
    if (salesRes.data) {
      salesData.value = salesRes.data;
      // อัปเดตตัวเลขสินค้าจากข้อมูลยอดขายหรือดึงแยกตามความเหมาะสม
      productsCount.value =
        new Set(salesRes.data.map((s: any) => s.product_id)).size || 15;
    }
  } catch (err) {
    console.error("❌ Load Error:", err);
  } finally {
    loading.value = false;
  }
};

// --- 4. Helper Functions ---
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num || 0);
};

const formatShortNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toFixed(0);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatChartDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
};

const getBarHeight = (value: number) => {
  const maxValue = Math.max(...salesData.value.map((item) => item.total), 1);
  return (value / maxValue) * 100;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: "warning",
    confirmed: "info",
    processing: "info",
    shipping: "primary",
    completed: "success",
    cancelled: "danger",
  };
  return classes[status] || "secondary";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "รอดำเนินการ",
    confirmed: "ยืนยันแล้ว",
    processing: "กำลังเตรียมสินค้า",
    shipping: "กำลังจัดส่ง",
    completed: "สำเร็จแล้ว",
    cancelled: "ยกเลิก",
  };
  return labels[status] || status;
};

// --- 5. Export Excel ---
const exportToExcel = () => {
  if (!recentOrders.value.length) return alert("ไม่มีข้อมูลสำหรับส่งออก");

  // 1. เตรียมข้อมูลสรุปยอดขายรายวัน (เหมือนในตารางที่เราเพิ่งทำ)
  const dailyData = dailyReportData.value.map(day => ({
    "วันที่": day.date,
    "จำนวนออเดอร์": day.orderCount,
    "ยอดขายรวม (บาท)": day.totalAmount,wwd
    "เฉลี่ยต่อบิล": (day.totalAmount / day.orderCount).toFixed(2)
  }));

  // 2. เตรียมข้อมูลสินค้าขายดี
  const productData = topProductsDisplay.value.map(item => ({
    "ชื่อสินค้า": item.name,
    "จำนวนที่ขายได้": item.count,
    "ยอดขายรวม": item.revenue
  }));

  // 3. สร้าง Workbook และเพิ่ม Sheet ต่างๆ
  const workbook = XLSX.utils.book_new();
  
  const sheet1 = XLSX.utils.json_to_sheet(dailyData);
  XLSX.utils.book_append_sheet(workbook, sheet1, "สรุปยอดขายรายวัน");

  const sheet2 = XLSX.utils.json_to_sheet(productData);
  XLSX.utils.book_append_sheet(workbook, sheet2, "สินค้าขายดี");

  // 4. สั่ง Download
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Business_Report_${today}.xlsx`);
};
// เพิ่ม Computed สำหรับคำนวณสรุปรายวัน
const dailyReportData = computed(() => {
  const orders = recentOrders.value || [];
  
  // สร้าง Object เพื่อเก็บข้อมูลแยกตามวันที่
  const grouped = orders.reduce((acc: any, order) => {
    // ตัดเอาแค่วันที่ (YYYY-MM-DD)
    const date = order.created_at.split('T')[0];
    
    if (!acc[date]) {
      acc[date] = { date, orderCount: 0, totalAmount: 0 };
    }
    
    acc[date].orderCount += 1;
    acc[date].totalAmount += Number(order.total) || 0;
    
    return acc;
  }, {});

  // แปลงเป็น Array และเรียงจากวันที่ล่าสุดขึ้นก่อน
  return Object.values(grouped).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});
const menuItems = ref([
  { id: "home", label: "หน้าแรก", icon: "🏠" },
  { id: "products", label: "สินค้า", icon: "📦" },
  { id: "orders", label: "คำสั่งซื้อ", icon: "📋" },
  { id: "customers", label: "ลูกค้า", icon: "👥" },
  { id: "reports", label: "รายงาน", icon: "📊" },
  { id: "settings", label: "ตั้งค่า", icon: "⚙️" },
]);

const userData = computed(() => ({
  name: user.value?.profile?.full_name || "ผู้ใช้งาน",
  email: user.value?.email || "",
  avatar: "👤",
}));

const toggleMobileSidebar = () =>
  (showMobileSidebar.value = !showMobileSidebar.value);
const closeMobileSidebar = () => (showMobileSidebar.value = false);
const handleToggle = (isCollapsed: boolean) =>
  (isSidebarCollapsed.value = isCollapsed);

const handleMenuClick = (item: any) => {
  navigateTo(`/${item.id === "home" ? "dashboard" : item.id}`);
};

onMounted(() => {
  loadData();
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
  justify-content: center;
}

.main-content.sidebar-collapsed {
  margin-left: 80px;
}

.content-wrapper {
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
}

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

.date-filter {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  border-color: #3b82f6;
  color: #3b82f6;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  gap: 1.5rem;
  align-items: center;
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-card.revenue .stat-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.stat-card.orders .stat-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.stat-card.products .stat-icon {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
}

.stat-card.customers .stat-icon {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
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
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.875rem;
  color: #6b7280;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.warning {
  color: #f59e0b;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f3f4f6;
  margin-bottom: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
}

.chart-container {
  height: 300px;
  margin-top: 1rem;
}

.simple-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 250px;
  gap: 0.5rem;
  padding: 1rem 0;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.chart-bar {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
}

.chart-bar-fill {
  width: 100%;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 0.5rem 0.5rem 0 0;
  transition: all 0.3s;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 0.5rem;
  position: relative;
}

.chart-bar-fill:hover {
  opacity: 0.8;
}

.bar-value {
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
}

.chart-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

.two-column-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.top-products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  transition: all 0.2s;
}

.product-item:hover {
  background: #f3f4f6;
}

.product-rank {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.product-stats {
  font-size: 0.875rem;
  color: #6b7280;
}

.product-bar {
  width: 100px;
  height: 8px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
}

.product-bar-fill {
  height: 100%;
  background: linear-gradient(to right, #667eea, #764ba2);
  border-radius: 9999px;
  transition: width 0.3s;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.pending {
  background: #fbbf24;
}

.status-dot.confirmed {
  background: #60a5fa;
}

.status-dot.processing {
  background: #818cf8;
}

.status-dot.shipping {
  background: #a78bfa;
}

.status-dot.completed {
  background: #34d399;
}

.status-dot.cancelled {
  background: #f87171;
}

.status-label {
  font-weight: 500;
  color: #374151;
}

.status-count {
  font-weight: 700;
  font-size: 1.25rem;
  color: #111827;
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

.empty-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr; /* แสดง 2 คอลัมน์คู่กัน */
    gap: 0.75rem; /* ลดช่องว่างลงเพื่อให้มีพื้นที่แสดงเนื้อหา */
  }

  .stat-card {
    flex-direction: column; /* ปรับไอคอนให้อยู่บน ข้อความอยู่ล่าง */
    align-items: flex-start;
    padding: 1rem;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem; /* ย่อขนาดไอคอน */
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.25rem; /* ย่อขนาดตัวเลขไม่ให้ล้นการ์ด */
  }
}
@media (max-width: 768px) {
  .data-table td {
    padding: 10px 12px;
    min-height: 45px; /* กันความสูงเพี้ยน */
  }

  /* ปรับให้ข้อความในช่องไม่เบียดกับหัวข้อเกินไป */
  .data-table td::before {
    flex: 1; /* ให้หัวข้อฝั่งซ้ายจองพื้นที่ไว้ */
    padding-right: 15px;
  }

  /* ตัวข้อมูลจริงฝั่งขวา */
  .data-table td {
    text-align: right;
    justify-content: space-between;
  }
}
.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981; /* สีเขียวสไตล์ Excel */
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn-export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* --- Media Queries สำหรับมือถือและแท็บเล็ต --- */

@media (max-width: 768px) {
  /* ซ่อนหัวตารางแบบปกติ */
  .data-table thead {
    display: none;
  }

  /* ปรับแถวตารางให้กลายเป็น Card */
  .data-table tr {
    display: block;
    background: white;
    border: 1px solid #edf2f7;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  /* ปรับแต่ละช่องให้แสดงผลเป็นบรรทัดเดียว (หัวข้อซ้าย - ข้อมูลขวา) */
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #f7fafc;
    text-align: right;
  }

  .data-table td:last-child {
    border-bottom: none;
  }

  /* ดึงชื่อหัวข้อจาก data-label มาแสดงด้านหน้า */
  .data-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: #718096;
    font-size: 0.85rem;
    text-align: left;
  }

  /* เน้นช่องเลขที่ออเดอร์ให้เด่นขึ้น */
  .data-table td[data-label="เลขที่"] {
    border-bottom: 1px solid #edf2f7;
    color: #4f46e5;
    font-weight: 700;
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
/* สำหรับมือถือขนาดเล็กมาก */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important; /* ยังคงไว้ 2 คอลัมน์ */
  }

  .stat-value {
    font-size: 1.1rem !important;
  }
}

/* คลุมส่วนรายการสินค้าแต่ละแถว */
.top-product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  background-color: #f8fafc; /* สีพื้นอ่อนๆ */
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.top-product-item:hover {
  background-color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-color: #e2e8f0;
}

/* ส่วนชื่อสินค้าและลำดับ */
.product-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.product-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #6366f1; /* สีม่วงน้ำเงิน */
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  border-radius: 8px;
}

/* ปรับสีลำดับ 1 ให้เด่นเป็นพิเศษ */
.top-product-item:first-child .product-rank {
  background: linear-gradient(135deg, #fbbf24, #f59e0b); /* สีทอง */
}

.product-name {
  font-weight: 500;
  color: #334155;
}

/* ส่วนตัวเลขยอดขาย */
.product-stats {
  text-align: right;
}

.product-count {
  display: block;
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.product-label {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}
</style>
