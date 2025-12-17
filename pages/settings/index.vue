<template>
  <div class="dashboard-container">
    <Sidebar
      :menu-items="menuItems"
      :user="userData"
      @item-click="handleMenuClick"
      @toggle="handleToggle"
    />

    <main class="main-content" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <div class="content-wrapper">
        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">ตั้งค่า</h1>
            <p class="page-subtitle">จัดการข้อมูลส่วนตัวและการตั้งค่าระบบ</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="['tab', { active: activeTab === tab.id }]"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="tab-panel">
            <div class="card">
              <h2 class="card-title">ข้อมูลส่วนตัว</h2>
              
              <form @submit.prevent="saveProfile" class="form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">ชื่อ-นามสกุล</label>
                    <input
                      v-model="profileForm.full_name"
                      type="text"
                      class="form-input"
                      placeholder="กรอกชื่อ-นามสกุล"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">อีเมล</label>
                    <input
                      v-model="profileForm.email"
                      type="email"
                      class="form-input"
                      disabled
                    />
                    <p class="form-hint">อีเมลไม่สามารถเปลี่ยนได้</p>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">เบอร์โทร</label>
                    <input
                      v-model="profileForm.phone"
                      type="tel"
                      class="form-input"
                      placeholder="081-234-5678"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">ที่อยู่</label>
                    <input
                      v-model="profileForm.address"
                      type="text"
                      class="form-input"
                      placeholder="ที่อยู่"
                    />
                  </div>
                </div>

                <div v-if="profileMessage" :class="['message', profileMessage.type]">
                  {{ profileMessage.text }}
                </div>

                <button type="submit" :disabled="profileLoading" class="btn-primary">
                  {{ profileLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                </button>
              </form>
            </div>

            <!-- Change Password -->
            <div class="card">
              <h2 class="card-title">เปลี่ยนรหัสผ่าน</h2>
              
              <form @submit.prevent="changePasswordHandler" class="form">
                <div class="form-group">
                  <label class="form-label">รหัสผ่านใหม่</label>
                  <input
                    v-model="passwordForm.newPassword"
                    type="password"
                    class="form-input"
                    placeholder="••••••••"
                    minlength="6"
                    required
                  />
                  <p class="form-hint">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
                </div>

                <div class="form-group">
                  <label class="form-label">ยืนยันรหัสผ่านใหม่</label>
                  <input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    class="form-input"
                    placeholder="••••••••"
                    minlength="6"
                    required
                  />
                </div>

                <div v-if="passwordMessage" :class="['message', passwordMessage.type]">
                  {{ passwordMessage.text }}
                </div>

                <button type="submit" :disabled="passwordLoading" class="btn-primary">
                  {{ passwordLoading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Shop Tab -->
          <div v-if="activeTab === 'shop'" class="tab-panel">
            <div class="card">
              <h2 class="card-title">ข้อมูลร้านค้า</h2>
              
              <form @submit.prevent="saveShop" class="form">
                <div class="form-group">
                  <label class="form-label">ชื่อร้าน</label>
                  <input
                    v-model="shopForm.shop_name"
                    type="text"
                    class="form-input"
                    placeholder="ชื่อร้านค้าของคุณ"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">ที่อยู่ร้าน</label>
                  <textarea
                    v-model="shopForm.shop_address"
                    class="form-textarea"
                    rows="3"
                    placeholder="ที่อยู่ร้านค้า"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">เบอร์โทรร้าน</label>
                    <input
                      v-model="shopForm.shop_phone"
                      type="tel"
                      class="form-input"
                      placeholder="081-234-5678"
                    />
                  </div>

                  <div class="form-group">
                    <label class="form-label">อีเมลร้าน</label>
                    <input
                      v-model="shopForm.shop_email"
                      type="email"
                      class="form-input"
                      placeholder="shop@example.com"
                    />
                  </div>
                </div>

                <div v-if="shopMessage" :class="['message', shopMessage.type]">
                  {{ shopMessage.text }}
                </div>

                <button type="submit" :disabled="shopLoading" class="btn-primary">
                  {{ shopLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="tab-panel">
            <div class="card">
              <h2 class="card-title">การแจ้งเตือน</h2>
              
              <form @submit.prevent="saveNotifications" class="form">
                <div class="settings-group">
                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">แจ้งเตือนคำสั่งซื้อใหม่</p>
                      <p class="setting-desc">รับการแจ้งเตือนเมื่อมีคำสั่งซื้อใหม่</p>
                    </div>
                    <label class="toggle">
                      <input v-model="notifyForm.notify_new_order" type="checkbox" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">แจ้งเตือนสต็อกใกล้หมด</p>
                      <p class="setting-desc">รับการแจ้งเตือนเมื่อสินค้าในสต็อกใกล้หมด</p>
                    </div>
                    <label class="toggle">
                      <input v-model="notifyForm.notify_low_stock" type="checkbox" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">แจ้งเตือนทางอีเมล</p>
                      <p class="setting-desc">รับการแจ้งเตือนทางอีเมล</p>
                    </div>
                    <label class="toggle">
                      <input v-model="notifyForm.notify_email" type="checkbox" />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">จำนวนสต็อกขั้นต่ำสำหรับแจ้งเตือน</label>
                  <input
                    v-model.number="notifyForm.low_stock_threshold"
                    type="number"
                    class="form-input"
                    min="0"
                  />
                  <p class="form-hint">แจ้งเตือนเมื่อสินค้าเหลือน้อยกว่าจำนวนนี้</p>
                </div>

                <div v-if="notifyMessage" :class="['message', notifyMessage.type]">
                  {{ notifyMessage.text }}
                </div>

                <button type="submit" :disabled="notifyLoading" class="btn-primary">
                  {{ notifyLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
                </button>
              </form>
            </div>
          </div>

          <!-- System Tab -->
          <div v-if="activeTab === 'system'" class="tab-panel">
            <div class="card">
              <h2 class="card-title">ตั้งค่าระบบ</h2>
              
              <form @submit.prevent="saveSystem" class="form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">สกุลเงิน</label>
                    <select v-model="systemForm.currency" class="form-select">
                      <option value="THB">THB - บาท (฿)</option>
                      <option value="USD">USD - ดอลลาร์ ($)</option>
                      <option value="EUR">EUR - ยูโร (€)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">เขตเวลา</label>
                    <select v-model="systemForm.timezone" class="form-select">
                      <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                      <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    </select>
                  </div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">ภาษา</label>
                    <select v-model="systemForm.language" class="form-select">
                      <option value="th">ไทย</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">รูปแบบวันที่</label>
                    <select v-model="systemForm.date_format" class="form-select">
                      <option value="dd/MM/yyyy">วัน/เดือน/ปี (31/12/2024)</option>
                      <option value="MM/dd/yyyy">เดือน/วัน/ปี (12/31/2024)</option>
                      <option value="yyyy-MM-dd">ปี-เดือน-วัน (2024-12-31)</option>
                    </select>
                  </div>
                </div>

                <div v-if="systemMessage" :class="['message', systemMessage.type]">
                  {{ systemMessage.text }}
                </div>

                <button type="submit" :disabled="systemLoading" class="btn-primary">
                  {{ systemLoading ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const { 
  getUserProfile, 
  updateUserProfile, 
  changePassword,
  getShopSettings,
  updateShopSettings
} = useSettings()

const isSidebarCollapsed = ref(false)
const activeTab = ref('profile')

const tabs = [
  { id: 'profile', label: 'โปรไฟล์', icon: '👤' },
  { id: 'shop', label: 'ข้อมูลร้าน', icon: '🏪' },
//   { id: 'notifications', label: 'การแจ้งเตือน', icon: '🔔' },
//   { id: 'system', label: 'ระบบ', icon: '⚙️' }
]

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

// Profile Form
const profileForm = ref({
  full_name: '',
  email: '',
  phone: '',
  address: ''
})
const profileLoading = ref(false)
const profileMessage = ref<any>(null)

// Password Form
const passwordForm = ref({
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)
const passwordMessage = ref<any>(null)

// Shop Form
const shopForm = ref({
  shop_name: '',
  shop_address: '',
  shop_phone: '',
  shop_email: ''
})
const shopLoading = ref(false)
const shopMessage = ref<any>(null)

// Notifications Form
const notifyForm = ref({
  notify_new_order: true,
  notify_low_stock: true,
  notify_email: true,
  low_stock_threshold: 10
})
const notifyLoading = ref(false)
const notifyMessage = ref<any>(null)

// System Form
const systemForm = ref({
  currency: 'THB',
  timezone: 'Asia/Bangkok',
  language: 'th',
  date_format: 'dd/MM/yyyy'
})
const systemLoading = ref(false)
const systemMessage = ref<any>(null)

// Load data
const loadProfile = async () => {
  if (!user.value?.id) return

  const { data } = await getUserProfile(user.value.id)
  if (data) {
    profileForm.value = {
      full_name: data.full_name || '',
      email: data.email || user.value.email || '',
      phone: data.phone || '',
      address: data.address || ''
    }
  }
}

const loadShopSettings = async () => {
  const { data } = await getShopSettings()
  if (data) {
    shopForm.value = {
      shop_name: data.shop_name || '',
      shop_address: data.shop_address || '',
      shop_phone: data.shop_phone || '',
      shop_email: data.shop_email || ''
    }
    
    notifyForm.value = {
      notify_new_order: data.notify_new_order ?? true,
      notify_low_stock: data.notify_low_stock ?? true,
      notify_email: data.notify_email ?? true,
      low_stock_threshold: data.low_stock_threshold || 10
    }

    systemForm.value = {
      currency: data.currency || 'THB',
      timezone: data.timezone || 'Asia/Bangkok',
      language: data.language || 'th',
      date_format: data.date_format || 'dd/MM/yyyy'
    }
  }
}

// Save handlers
const saveProfile = async () => {
  if (!user.value?.id) return

  profileLoading.value = true
  profileMessage.value = null

  const { error } = await updateUserProfile(user.value.id, {
    full_name: profileForm.value.full_name,
    phone: profileForm.value.phone,
    address: profileForm.value.address
  })

  if (error) {
    profileMessage.value = {
      type: 'error',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    }
  } else {
    profileMessage.value = {
      type: 'success',
      text: 'บันทึกข้อมูลสำเร็จ'
    }
  }

  profileLoading.value = false

  setTimeout(() => {
    profileMessage.value = null
  }, 3000)
}

const changePasswordHandler = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = {
      type: 'error',
      text: 'รหัสผ่านไม่ตรงกัน'
    }
    return
  }

  passwordLoading.value = true
  passwordMessage.value = null

  const { error } = await changePassword(passwordForm.value.newPassword)

  if (error) {
    passwordMessage.value = {
      type: 'error',
      text: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน'
    }
  } else {
    passwordMessage.value = {
      type: 'success',
      text: 'เปลี่ยนรหัสผ่านสำเร็จ'
    }
    passwordForm.value = {
      newPassword: '',
      confirmPassword: ''
    }
  }

  passwordLoading.value = false

  setTimeout(() => {
    passwordMessage.value = null
  }, 3000)
}

const saveShop = async () => {
  shopLoading.value = true
  shopMessage.value = null

  const { error } = await updateShopSettings(shopForm.value)

  if (error) {
    shopMessage.value = {
      type: 'error',
      text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    }
  } else {
    shopMessage.value = {
      type: 'success',
      text: 'บันทึกข้อมูลสำเร็จ'
    }
  }

  shopLoading.value = false

  setTimeout(() => {
    shopMessage.value = null
  }, 3000)
}

const saveNotifications = async () => {
  notifyLoading.value = true
  notifyMessage.value = null

  const { error } = await updateShopSettings(notifyForm.value)

  if (error) {
    notifyMessage.value = {
      type: 'error',
      text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า'
    }
  } else {
    notifyMessage.value = {
      type: 'success',
      text: 'บันทึกการตั้งค่าสำเร็จ'
    }
  }

  notifyLoading.value = false

  setTimeout(() => {
    notifyMessage.value = null
  }, 3000)
}

const saveSystem = async () => {
  systemLoading.value = true
  systemMessage.value = null

  const { error } = await updateShopSettings(systemForm.value)

  if (error) {
    systemMessage.value = {
      type: 'error',
      text: 'เกิดข้อผิดพลาดในการบันทึกการตั้งค่า'
    }
  } else {
    systemMessage.value = {
      type: 'success',
      text: 'บันทึกการตั้งค่าสำเร็จ'
    }
  }

  systemLoading.value = false

  setTimeout(() => {
    systemMessage.value = null
  }, 3000)
}

const handleMenuClick = (item: any) => {
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

const handleToggle = (isCollapsed: boolean) => {
  isSidebarCollapsed.value = isCollapsed
}

onMounted(() => {
  loadProfile()
  loadShopSettings()
})
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
  max-width: 1200px;
  width: 100%;
}

.page-header {
  margin-bottom: 2rem;
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

.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.tab:hover {
  color: #111827;
  background: #f9fafb;
}

.tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.tab-icon {
  font-size: 1.25rem;
}

.card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
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

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  background: #f9fafb;
  border-radius: 0.75rem;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.setting-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 34px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #667eea;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

.message {
  padding: 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message.error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }

  .content-wrapper {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .tabs-container {
    overflow-x: auto;
  }
}
</style>