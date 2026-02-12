<template>
  <div class="dashboard-container">
    <button class="floating-hamburger-btn" @click="toggleMobileSidebar">
      <div class="hamburger-icon-wrapper">
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
      </div>
    </button>

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

    <CartModal
      :is-open="isCartOpen"
      :cart="cart"
      :total="cartTotal"
      @close="isCartOpen = false"
      @remove="removeFromCart"
      @update-qty="updateQuantity"
      @checkout="handleCheckout"
    />
    <main
      class="main-content"
      :class="{ 'sidebar-collapsed': isSidebarCollapsed }"
    >
      <div class="content-wrapper">
        <div class="page-header">
          <div>
            <h1 class="page-title">เลือกซื้อสินค้า</h1>
            <p class="page-subtitle">พบกับสินค้าคุณภาพในราคาพิเศษ</p>
          </div>

          <button class="cart-btn" @click="isCartOpen = true">
            <span>🛒</span>
            <span v-if="cart.length > 0" class="cart-count">{{
              cart.length
            }}</span>
          </button>
        </div>

        <div class="shop-filter-bar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาสินค้าที่คุณต้องการ..."
              class="search-input"
            />
          </div>

          <div class="category-container">
            <div class="category-tags">
              <button
                v-for="item in [
                  'ทั้งหมด',
                  'เสื้อผ้า',
                  'หนังสือ',
                  'อาหารและเครื่องดื่ม',
                  'อุปกรณ์อิเล็กทรอนิกส์',
                  'ของใช้ในบ้าน',
                ]"
                :key="item"
                class="tag"
                :class="{ active: selectedCategory === item }"
                @click="selectedCategory = item"
              >
                {{ item }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
        </div>

        <div v-else class="product-grid">
          <div
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
          >
            <div class="product-image">
              <img
                :src="product.image || '/placeholder-product.png'"
                alt="product image"
              />
              <div v-if="product.stock <= 5" class="stock-badge">
                เหลือ {{ product.stock }} ชิ้น
              </div>
            </div>

            <div class="product-info">
              <span class="category-label">{{ product.category }}</span>
              <h3 class="product-name">{{ product.name }}</h3>

              <div class="product-footer">
                <span class="product-price"
                  >฿{{ formatNumber(product.price) }}</span
                >
              </div>
              <button class="btn-add-cart" @click="addToCart(product)">
                เพิ่มลงรถเข็น
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
<script setup>
import CartModal from "~/components/Shops/CartModal.vue";

// 1. นำเข้า Utilities
const { user } = useAuth();
const { $supabase } = useNuxtApp();
const { initAuth } = useAuth(); // เพิ่ม initAuth
const userRoleCookie = useCookie("user-role"); // 👈 ดึงค่า Role จาก Cooki
// 2. สถานะของ UI และข้อมูล
const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);
const loading = ref(true); // ตั้งเป็น true เพื่อรอโหลดข้อมูล
const searchQuery = ref("");

const isCartOpen = ref(false);
const cart = ref([]);
const products = ref([]); // เริ่มต้นด้วย Array ว่าง
const updateQuantity = ({ index, change }) => {
  const item = cart.value[index];
  if (item) {
    const newQty = item.quantity + change;
    if (newQty > 0) item.quantity = newQty;
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};
const fetchProducts = async () => {
  try {
    loading.value = true;
    const { data, error } = await $supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    products.value = data.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category || "ทั่วไป",
      stock: item.stock,
      image: item.image_url, // ดึง URL รูปภาพจาก DB
    }));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    loading.value = false;
  }
};
const handleCheckout = async () => {
  // console.log(user.value.profile,'datas');
  const userProfile = user.value.profile;
  // return
  if (cart.value.length === 0) {
    alert("กรุณาเลือกสินค้าลงตะกร้าก่อนครับ");
    return;
  }

  try {
    loading.value = true;

    // 1. สร้างเลขที่ออเดอร์ (ตัวอย่าง: ORD-492831)
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // 2. บันทึกข้อมูลลงตาราง 'orders' ใน Supabase
    const { data, error } = await $supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          // ดึงชื่อจริง (full_name) จากข้อมูลโปรไฟล์ที่โหลดไว้
          customer_name: userProfile?.full_name || userData.value.name, 
          // ดึงเบอร์โทรและที่อยู่จากตาราง profiles
          customer_phone: userProfile?.phone || "ไม่ระบุเบอร์โทร",
          customer_address: userProfile?.address || "ไม่ระบุที่อยู่",
          // ใช้ชื่อคอลัมน์ total_amount ให้ตรงกับในฐานข้อมูล
          total: cartTotal.value, 
          status: 'pending' // สถานะเริ่มต้นตามรูปตัวอย่าง
        },
      ])
      .select();

    if (error) throw error;

    // 3. แจ้งเตือนและล้างข้อมูลหลังบันทึกสำเร็จ
    alert(`ยืนยันการสั่งซื้อสำเร็จ! เลขที่ออเดอร์: ${orderNumber}`);

    cart.value = []; // ล้างตะกร้าสินค้า
    isCartOpen.value = false; // ปิด Modal
    
  } catch (error) {
    console.error("Error creating order:", error.message);
    alert("ไม่สามารถบันทึกคำสั่งซื้อได้: " + error.message);
  } finally {
    loading.value = false;
  }
};

// 4. เรียกใช้ฟังก์ชันเมื่อ Component ถูกโหลด
onMounted(() => {
  fetchProducts();
});

// 5. ระบบค้นหา (Computed Filter)

const selectedCategory = ref("ทั้งหมด"); // สถานะหมวดหมู่ที่เลือก
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    // 1. กรองตามตัวอักษรที่พิมพ์ในช่องค้นหา (เทียบกับชื่อสินค้า)
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.value.toLowerCase());

    // 2. กรองตามหมวดหมู่ที่กดเลือก (ถ้าเลือก 'ทั้งหมด' ให้โชว์ทุกอย่าง)
    const matchesCategory =
      selectedCategory.value === "ทั้งหมด" ||
      product.category === selectedCategory.value;

    return matchesSearch && matchesCategory;
  });
});
// --- ฟังก์ชันจัดการ UI (คงเดิม) ---
const toggleMobileSidebar = () =>
  (showMobileSidebar.value = !showMobileSidebar.value);
const closeMobileSidebar = () => (showMobileSidebar.value = false);
const handleToggle = (isCollapsed) => (isSidebarCollapsed.value = isCollapsed);

const handleMenuClick = (item) => {
  if (item.id === "home") navigateTo("/");
  if (item.id === "products") navigateTo("/products");
  if (item.id === "shop") navigateTo("/shop");
  closeMobileSidebar();
};

const userData = computed(() => {
  return {
    name: user.value?.user_metadata?.full_name || "testuser",
    email: user.value?.email || "",
    avatar: "👤",
    role: user.value?.user_metadata?.role || userRoleCookie.value || "customer", // 👈 ดึงจาก Cookie ถ้า User ยังไม่มา
  };
});
const menuItems = [
  { id: "home", label: "หน้าแรก", icon: "🏠", roles: ["admin"] },
  { id: "products", label: "สินค้า", icon: "📦", roles: ["admin"] },
  { id: "shop", label: "ร้านค้า", icon: "🛒", roles: ["customer", "admin"] },
  {
    id: "settings",
    label: "ตั้งค่า",
    icon: "⚙️",
    roles: ["admin", "customer"],
  },
];
onMounted(async () => {
  // รอเช็ค Auth ให้ชัวร์ก่อนโหลดสินค้า
  if (!user.value) {
    await initAuth();
  }
  await fetchProducts();
});
const formatNumber = (num) => new Intl.NumberFormat("th-TH").format(num || 0);
// คำนวณราคารวมทั้งหมดในตะกร้า
const cartTotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
});
const addToCart = (product) => {
  // 1. ตรวจสอบว่ามีสินค้านี้ในตะกร้าหรือยัง
  const existingItem = cart.value.find((item) => item.id === product.id);

  if (existingItem) {
    // 2. ถ้ามีแล้ว ให้บวกจำนวนเพิ่ม
    existingItem.quantity++;
  } else {
    // 3. ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่ (สร้าง object ใหม่ที่มี quantity: 1)
    cart.value.push({
      ...product,
      quantity: 1,
    });
  }

  // (Optional) เปิด Modal ทันทีเมื่อกดเพิ่ม หรือจะแค่โชว์เลขที่ปุ่มรถเข็นก็ได้
  // isCartOpen.value = true;
};
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: #f9fafb;
  position: relative;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: flex !important;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1100;
  width: 48px;
  height: 48px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.mobile-menu-btn:hover {
  background: #f9fafb;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

.hamburger-line {
  width: 24px;
  height: 2.5px;
  background: #1e293b;
  border-radius: 2px;
}

/* Mobile Overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.main-content {
  margin-left: 300px;
  min-height: 100vh;
  transition: margin-left 0.3s ease;
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

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  font-size: 1.5rem;
}

.category-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.stock-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.stock-badge.in-stock {
  background: #d1fae5;
  color: #065f46;
}

.stock-badge.low-stock {
  background: #fef3c7;
  color: #92400e;
}

.stock-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
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

.badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit {
  background: #dbeafe;
}

.btn-edit:hover {
  background: #bfdbfe;
  transform: scale(1.1);
}

.btn-delete {
  background: #fee2e2;
}

.btn-delete:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.confirm-modal {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

.confirm-modal h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
}

.confirm-modal p {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.confirm-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-danger {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0 !important;
  }

  .content-wrapper {
    padding: 1rem;
    padding-top: 5rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .filters {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  /* --- ส่วน Stats Grid: ปรับให้เรียง 2 คอลัมน์แบบในรูป --- */
  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important; /* บังคับแถวละ 2 กล่อง */
    gap: 10px !important; /* ระยะห่างพอดีๆ ไม่กว้างเกินไป */
    margin-bottom: 1.5rem;
  }

  .stat-card {
    padding: 1rem !important; /* ลด padding ให้กระชับ */
    flex-direction: row !important; /* จัด icon กับตัวเลขไว้คนละฝั่ง */
    justify-content: space-between;
    height: auto;
    min-height: 90px;
    margin-bottom: 0 !important; /* ให้ grid จัดการ margin เอง */
  }

  .stat-value {
    font-size: 1.25rem !important; /* ลดขนาดตัวเลขไม่ให้เบียดกัน */
    margin-top: 4px;
  }

  .stat-label {
    font-size: 0.8rem !important; /* ชื่อหัวข้อเล็กลงนิดนึง */
  }

  .stat-icon {
    width: 2.5rem !important;
    height: 2.5rem !important;
    font-size: 1.2rem !important;
    min-width: 2.5rem;
  }

  /* --- ส่วน Filters & Search: ปรับให้เต็มความกว้างและกดง่าย --- */
  .filters {
    flex-direction: column !important; /* ค้นหาอยู่บน Dropdown อยู่ล่าง */
    gap: 12px !important;
  }

  .search-box {
    width: 100% !important;
  }

  .filter-select {
    width: 100% !important; /* ตัวเลือกสถานะกว้างเต็มจอ */
  }

  /* --- ส่วน Main Content --- */
  .main-content {
    margin-left: 0 !important;
  }
}

/* Products.vue <style scoped> */

@media (max-width: 640px) {
  /* ซ่อน Header ของตารางทิ้งไปเลย */
  .data-table thead {
    display: none;
  }

  /* ปรับแต่ละแถว (tr) ให้กลายเป็น Card */
  .data-table tr {
    display: block;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  }

  /* จัดการแต่ละช่อง (td) ให้เรียงเป็นบรรทัด */
  .data-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    padding: 0.5rem 0;
    text-align: right;
  }

  /* ใส่ Label ให้แต่ละช่องโดยใช้ pseudo-element (เทคนิค Senior!) */
  .data-table td::before {
    content: attr(data-label); /* ต้องไปเพิ่ม attribute นี้ใน HTML ด้วย */
    font-weight: 600;
    color: #64748b;
    float: left;
    margin-right: 1rem;
  }

  /* ปรับรูปสินค้าให้ใหญ่ขึ้นในโหมด Card */
  .product-img {
    width: 60px;
    height: 60px;
    margin-bottom: 0.5rem;
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

.shop-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.category-tags {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 5px;
}

.tag {
  padding: 0.5rem 1.25rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.tag.active {
  background: #4f46e5;
  color: white;
  border-color: #4f46e5;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 1.25rem;
  border: 1px solid #f3f4f6;
  overflow: hidden;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.product-image {
  position: relative;
  aspect-ratio: 1/1;
  background: #f9fafb;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-cover: cover;
}

.stock-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #ef4444;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: bold;
}

.product-info {
  padding: 1.25rem;
}

.category-label {
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
  text-transform: uppercase;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0.5rem 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: #111827;
}

.btn-add-cart {
  background: #f3f4f6;
  color: #1f2937;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-cart:hover {
  background: #4f46e5;
  color: white;
}

.cart-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ef4444;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr); /* บนมือถือโชว์ 2 คอลัมน์คู่กัน */
    gap: 10px;
  }

  .product-info {
    padding: 0.75rem;
  }

  .product-price {
    font-size: 1rem;
  }

  .btn-add-cart {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
  }
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(280px, 1fr)
  ); /* เพิ่มจาก 240px เป็น 280px */
  gap: 2rem;
}

.product-card {
  background: white;
  border-radius: 1.5rem; /* มนขึ้น */
  border: 1px solid #f1f5f9;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* ปรับส่วนรูปภาพให้ใหญ่และชัด */
.product-image {
  width: 100%;
  height: 250px; /* เพิ่มความสูงของพื้นที่แสดงรูป */
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain; /* รูปจะขยายใหญ่ที่สุดเท่าที่จะทำได้โดยไม่เสียสัดส่วน */
}

.product-card:hover .product-image img {
  transform: scale(1.08); /* ซูมเบาๆ เวลาเอาเมาส์วาง */
}

/* ปรับตัวหนังสือให้ดูแพง */
.product-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.25rem; /* ใหญ่ขึ้น */
  font-weight: 700;
  color: #0f172a;
  margin: 0.5rem 0;
  line-height: 1.4;
  height: 3.5rem; /* ล็อกความสูงไว้ 2 บรรทัด */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #4f46e5; /* สี Indigo */
}

.btn-add-cart {
  background: #4f46e5;
  color: white;
  width: 100%; /* ปุ่มกว้างเต็ม Card ให้กดง่าย */
  padding: 0.8rem;
  border-radius: 0.75rem;
  margin-top: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add-cart:hover {
  background: #4338ca;
}

@media (max-width: 640px) {
  .product-grid {
    grid-template-columns: 1fr; /* บนมือถือแสดงแถวละ 1 อันใหญ่ๆ */
    gap: 1.5rem;
  }
}
</style>
