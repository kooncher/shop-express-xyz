<template>
  <div class="dashboard-container">
    <!-- Mobile Menu Button -->


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

    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">จัดการสินค้า</h1>
            <p class="page-subtitle">จัดการสินค้าทั้งหมดในระบบ</p>
          </div>
          
          <button @click="openAddModal" class="btn-primary">
            <span>➕</span>
            <span>เพิ่มสินค้า</span>
          </button>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">สินค้าทั้งหมด</p>
              <p class="stat-value">{{ products.length }}</p>
            </div>
            <div class="stat-icon">📦</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">สินค้าคงเหลือน้อย</p>
              <p class="stat-value">{{ lowStockCount }}</p>
            </div>
            <div class="stat-icon">⚠️</div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <p class="stat-label">สินค้าหมด</p>
              <p class="stat-value">{{ outOfStockCount }}</p>
            </div>
            <div class="stat-icon">❌</div>
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
                placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
                class="search-input"
                @input="handleSearch"
              />
            </div>

            <select v-model="selectedCategory" @change="loadProducts" class="filter-select">
              <option value="">ทุกหมวดหมู่</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>

            <select v-model="filterActive" @change="loadProducts" class="filter-select">
              <option value="">ทั้งหมด</option>
              <option value="true">เปิดใช้งาน</option>
              <option value="false">ปิดใช้งาน</option>
            </select>
          </div>
        </div>

        <!-- Products Table or Empty State -->
        <div class="card">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>กำลังโหลดข้อมูล...</p>
          </div>

          <div v-else-if="products.length === 0" class="empty-state">
            <span class="empty-icon">📦</span>
            <h3>ยังไม่มีสินค้าในระบบ</h3>
            <p>เริ่มต้นเพิ่มสินค้าแรกของคุณเลย!</p>
            <button @click="openAddModal" class="btn-primary">
              เพิ่มสินค้าแรก
            </button>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>รูปภาพ</th>
                  <th>ชื่อสินค้า</th>
                  <th>SKU</th>
                  <th>หมวดหมู่</th>
                  <th>ราคา</th>
                  <th>สต็อก</th>
                  <th>สถานะ</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
     <tbody>
  <tr v-for="product in products" :key="product.id">
    <td data-label="รูปภาพ">
      <div class="product-image">
        <img v-if="product.image_url" :src="product.image_url" :alt="product.name" />
        <span v-else class="no-image">📦</span>
      </div>
    </td>
    <td data-label="ชื่อสินค้า" class="font-semibold">{{ product.name }}</td>
    <td data-label="SKU" class="text-muted">{{ product.sku || '-' }}</td>
    <td data-label="หมวดหมู่">
      <span class="category-badge">{{ getCategoryName(product.category_id) }}</span>
    </td>
    <td data-label="ราคา" class="font-semibold">฿{{ formatNumber(product.price) }}</td>
    <td data-label="สต็อก">
      <span :class="['stock-badge', getStockStatus(product.stock, product.min_stock)]">
        {{ product.stock }}
      </span>
    </td>
    <td data-label="สถานะ">
      <span :class="['badge', product.is_active ? 'success' : 'danger']">
        {{ product.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
      </span>
    </td>
    <td data-label="จัดการ">
      <div class="action-buttons">
        <button @click="openEditModal(product)" class="btn-icon btn-edit">✏️</button>
        <button @click="confirmDelete(product)" class="btn-icon btn-delete">🗑️</button>
      </div>
    </td>
  </tr>
</tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Product Modal -->
    <ProductModal
      v-if="showModal"
      :product="selectedProduct"
      :categories="categories"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>ยืนยันการลบสินค้า</h3>
        <p>คุณต้องการลบสินค้า "{{ productToDelete?.name }}" ใช่หรือไม่?</p>
        <div class="confirm-actions">
          <button @click="showDeleteConfirm = false" class="btn-secondary">ยกเลิก</button>
          <button @click="handleDelete" class="btn-danger">ลบสินค้า</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProductModal from '~/components/products/ProductModal.vue'

const { user } = useAuth()
const { $supabase } = useNuxtApp()

const isSidebarCollapsed = ref(false)
const showMobileSidebar = ref(false)
const loading = ref(true)
const showModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedProduct = ref(null)
const productToDelete = ref(null)
const products = ref([])
const categories = ref([])
const searchQuery = ref('')
const selectedCategory = ref('')
const filterActive = ref('')

const menuItems = ref([
  { id: 'home', label: 'หน้าแรก', icon: '🏠' },
  { id: 'products', label: 'สินค้า', icon: '📦' },
  { id: 'orders', label: 'คำสั่งซื้อ', icon: '📋' },
  { id: 'customers', label: 'ลูกค้า', icon: '👥' },
  { id: 'reports', label: 'รายงาน', icon: '📊' },
  { id: 'settings', label: 'ตั้งค่า', icon: '⚙️' }
])

const userData = computed(() => ({
  name: user.value?.profile?.full_name || 'ผู้ใช้งาน',
  email: user.value?.email || '',
  avatar: '👤'
}))

// Computed properties
const lowStockCount = computed(() => 
  products.value.filter(p => p.stock > 0 && p.stock <= p.min_stock).length
)

const outOfStockCount = computed(() => 
  products.value.filter(p => p.stock === 0).length
)

// Mobile Sidebar Controls
const toggleMobileSidebar = () => {
  showMobileSidebar.value = !showMobileSidebar.value
}

const closeMobileSidebar = () => {
  showMobileSidebar.value = false
}

const handleToggle = (isCollapsed) => {
  isSidebarCollapsed.value = isCollapsed
}

const handleMenuClick = (item) => {
  closeMobileSidebar()
  
  if (item.id === 'home') {
    navigateTo('/dashboard')
  } else if (item.id === 'products') {
    navigateTo('/products')
  } else if (item.id === 'orders') {
    navigateTo('/orders')
  } else if (item.id === 'customers') {
    navigateTo('/customers')
  } else if (item.id === 'reports') {
    navigateTo('/reports')
  } else if (item.id === 'settings') {
    navigateTo('/settings')
  }
}

// Load products
const loadProducts = async () => {
  loading.value = true
  try {
    let query = $supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (selectedCategory.value) {
      query = query.eq('category_id', selectedCategory.value)
    }

    if (filterActive.value) {
      query = query.eq('is_active', filterActive.value === 'true')
    }

    if (searchQuery.value) {
      query = query.or(`name.ilike.%${searchQuery.value}%,sku.ilike.%${searchQuery.value}%`)
    }

    const { data, error } = await query

    if (error) throw error
    products.value = data || []
  } catch (error) {
    console.error('Error loading products:', error)
    alert('เกิดข้อผิดพลาดในการโหลดสินค้า')
  } finally {
    loading.value = false
  }
}

// Load categories
const loadCategories = async () => {
  try {
    const { data, error } = await $supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

// Search with debounce
let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 500)
}

// Modal actions
const openAddModal = () => {
  selectedProduct.value = null
  showModal.value = true
}

const openEditModal = (product) => {
  selectedProduct.value = { ...product }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedProduct.value = null
}

const handleSave = async () => {
  closeModal()
  await loadProducts()
}

// Delete actions
const confirmDelete = (product) => {
  productToDelete.value = product
  showDeleteConfirm.value = true
}

const handleDelete = async () => {
  if (!productToDelete.value) return

  try {
    if (productToDelete.value.image_path) {
      await $supabase.storage
        .from('product-images')
        .remove([productToDelete.value.image_path])
    }

    const { error } = await $supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.value.id)

    if (error) throw error

    alert('ลบสินค้าสำเร็จ!')
    await loadProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    alert('เกิดข้อผิดพลาดในการลบสินค้า')
  } finally {
    showDeleteConfirm.value = false
    productToDelete.value = null
  }
}

// Helper functions
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || '-'
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0)
}

const getStockStatus = (stock, minStock) => {
  if (stock === 0) return 'out-of-stock'
  if (stock <= minStock) return 'low-stock'
  return 'in-stock'
}

// Initialize
onMounted(async () => {
  await Promise.all([loadCategories(), loadProducts()])
})
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
  from { opacity: 0; }
  to { opacity: 1; }
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
  to { transform: rotate(360deg); }
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
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
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
</style>