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
                      @input="formatPhoneNumber"
                      placeholder="081-234-5678"
                      maxlength="12"
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

                <div
                  v-if="profileMessage"
                  :class="['message', profileMessage.type]"
                >
                  {{ profileMessage.text }}
                </div>

                <button
                  type="submit"
                  :disabled="profileLoading"
                  class="btn-primary"
                >
                  {{ profileLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
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

                <div
                  v-if="passwordMessage"
                  :class="['message', passwordMessage.type]"
                >
                  {{ passwordMessage.text }}
                </div>

                <button
                  type="submit"
                  :disabled="passwordLoading"
                  class="btn-primary"
                >
                  {{ passwordLoading ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน" }}
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
                      @input="formatPhoneNumber"
                      maxlength="12"
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

                <button
                  type="submit"
                  :disabled="shopLoading"
                  class="btn-primary"
                >
                  {{ shopLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
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
                      <p class="setting-desc">
                        รับการแจ้งเตือนเมื่อมีคำสั่งซื้อใหม่
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        v-model="notifyForm.notify_new_order"
                        type="checkbox"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">แจ้งเตือนสต็อกใกล้หมด</p>
                      <p class="setting-desc">
                        รับการแจ้งเตือนเมื่อสินค้าในสต็อกใกล้หมด
                      </p>
                    </div>
                    <label class="toggle">
                      <input
                        v-model="notifyForm.notify_low_stock"
                        type="checkbox"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div class="setting-item">
                    <div class="setting-info">
                      <p class="setting-label">แจ้งเตือนทางอีเมล</p>
                      <p class="setting-desc">รับการแจ้งเตือนทางอีเมล</p>
                    </div>
                    <label class="toggle">
                      <input
                        v-model="notifyForm.notify_email"
                        type="checkbox"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label"
                    >จำนวนสต็อกขั้นต่ำสำหรับแจ้งเตือน</label
                  >
                  <input
                    v-model.number="notifyForm.low_stock_threshold"
                    type="number"
                    class="form-input"
                    min="0"
                  />
                  <p class="form-hint">
                    แจ้งเตือนเมื่อสินค้าเหลือน้อยกว่าจำนวนนี้
                  </p>
                </div>

                <div
                  v-if="notifyMessage"
                  :class="['message', notifyMessage.type]"
                >
                  {{ notifyMessage.text }}
                </div>

                <button
                  type="submit"
                  :disabled="notifyLoading"
                  class="btn-primary"
                >
                  {{ notifyLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า" }}
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
                      <option value="Asia/Singapore">
                        Asia/Singapore (GMT+8)
                      </option>
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
                    <select
                      v-model="systemForm.date_format"
                      class="form-select"
                    >
                      <option value="dd/MM/yyyy">
                        วัน/เดือน/ปี (31/12/2024)
                      </option>
                      <option value="MM/dd/yyyy">
                        เดือน/วัน/ปี (12/31/2024)
                      </option>
                      <option value="yyyy-MM-dd">
                        ปี-เดือน-วัน (2024-12-31)
                      </option>
                    </select>
                  </div>
                </div>

                <div
                  v-if="systemMessage"
                  :class="['message', systemMessage.type]"
                >
                  {{ systemMessage.text }}
                </div>

                <button
                  type="submit"
                  :disabled="systemLoading"
                  class="btn-primary"
                >
                  {{ systemLoading ? "กำลังบันทึก..." : "บันทึกการตั้งค่า" }}
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
import { useSettings } from '~/composables/useSettings'
definePageMeta({
  middleware: "auth",
});

const { user } = useAuth();
const isAdmin = computed(() => user.value?.profile?.role === "admin");

const {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getShopSettings,
  updateShopSettings,
} = useSettings();

const activeTab = ref("profile");
const showMobileSidebar = ref(false);
const isSidebarCollapsed = ref(false);
const userRoleCookie = useCookie("user-role"); // 👈 ดึงค่า Role จาก Cooki

// ปรับ tabs ให้เป็น computed
const tabs = computed(() => {
  // เริ่มต้นด้วยแท็บพื้นฐานที่ทุกคนต้องเห็น
  const menuItems = [{ id: "profile", label: "โปรไฟล์", icon: "👤" }];

  // ถ้าเป็น admin ให้เพิ่มแท็บข้อมูลร้านเข้าไป
  if (isAdmin.value) {
    menuItems.push({ id: "shop", label: "ข้อมูลร้าน", icon: "🏪" });
  }

  return menuItems;
});

const menuItems = [
  { id: "home", label: "หน้าแรก", icon: "🏠", roles: ["admin"] },
  { id: "products", label: "สินค้า", icon: "📦", roles: ["admin"] },
  { id: "orders", label: "คำสั่งซื้อ", icon: "📋", roles: ["admin"] },
  { id: "customers", label: "ลูกค้า", icon: "👥", roles: ["admin"] }, // เฉพาะ Admin
  { id: "reports", label: "รายงาน", icon: "📊", roles: ["admin"] }, // เฉพาะ Admin
  { id: "shop", label: "ร้านค้า", icon: "🛒", roles: ["customer"] },
  {
    id: "myorders",
    label: "คำสั่งซื้อของฉัน",
    icon: "📋",
    roles: ["customer"],
  },
  {
    id: "settings",
    label: "ตั้งค่า",
    icon: "⚙️",
    roles: ["admin", "customer"],
  }, // เฉพาะ Admin
];

const userData = computed(() => {
  return {
    name: user.value?.user_metadata?.full_name || "testuser",
    email: user.value?.email || "",
    avatar: "👤",
    role: user.value?.user_metadata?.role || userRoleCookie.value || "customer", // 👈 ดึงจาก Cookie ถ้า User ยังไม่มา
  };
});

// Profile Form
const profileForm = ref({
  full_name: "",
  email: "",
  phone: "",
  address: "",
});
const profileLoading = ref(false);
const profileMessage = ref<any>(null);

// Password Form
const passwordForm = ref({
  newPassword: "",
  confirmPassword: "",
});
const passwordLoading = ref(false);
const passwordMessage = ref<any>(null);

// Shop Form
const shopForm = ref({
  shop_name: "",
  shop_address: "",
  shop_phone: "",
  shop_email: "",
});
const shopLoading = ref(false);
const shopMessage = ref<any>(null);

// Notifications Form
const notifyForm = ref({
  notify_new_order: true,
  notify_low_stock: true,
  notify_email: true,
  low_stock_threshold: 10,
});
const notifyLoading = ref(false);
const notifyMessage = ref<any>(null);

// System Form
const systemForm = ref({
  currency: "THB",
  timezone: "Asia/Bangkok",
  language: "th",
  date_format: "dd/MM/yyyy",
});
const systemLoading = ref(false);
const systemMessage = ref<any>(null);

// Load data
const loadProfile = async () => {
  if (!user.value?.id) return;

  const { data } = await getUserProfile(user.value.id);
  if (data) {
    profileForm.value = {
      full_name: data.full_name || "",
      email: data.email || user.value.email || "",
      phone: data.phone || "",
      address: data.address || "",
    };
  }
};

const loadShopSettings = async () => {
  const { data } = await getShopSettings();
  if (data) {
    shopForm.value = {
      shop_name: data.shop_name || "",
      shop_address: data.shop_address || "",
      shop_phone: data.shop_phone || "",
      shop_email: data.shop_email || "",
    };

    notifyForm.value = {
      notify_new_order: data.notify_new_order ?? true,
      notify_low_stock: data.notify_low_stock ?? true,
      notify_email: data.notify_email ?? true,
      low_stock_threshold: data.low_stock_threshold || 10,
    };

    systemForm.value = {
      currency: data.currency || "THB",
      timezone: data.timezone || "Asia/Bangkok",
      language: data.language || "th",
      date_format: data.date_format || "dd/MM/yyyy",
    };
  }
};
const validatePhone = (phone: string) => {
  // รองรับ 08xxxxxxxx, 09xxxxxxxx, 06xxxxxxxx และรูปแบบมีขีด 08x-xxx-xxxx
  const phoneRegex = /^(06|08|09)\d{8}$|^(06|08|09)\d{1}-\d{3}-\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, "")); // ลบช่องว่างออกก่อนเช็ค
};
// Save handlers
const formatPhoneNumber = (e: any) => {
  let value = e.target.value.replace(/\D/g, ""); // ลบทุกอย่างที่ไม่ใช่ตัวเลข
  if (value.length > 10) value = value.slice(0, 10); // จำกัดแค่ 10 หลัก

  // จัดรูปแบบเป็น 0xx-xxx-xxxx
  if (value.length > 6) {
    value = `${value.slice(0, 3)}-${value.slice(3, 6)}-${value.slice(6)}`;
  } else if (value.length > 3) {
    value = `${value.slice(0, 3)}-${value.slice(3)}`;
  }

  profileForm.value.phone = value;
};

const saveProfile = async () => {
  if (!user.value?.id) return;

  profileLoading.value = true;
  profileMessage.value = null;

  // 1. Validate เบอร์โทรก่อนส่งข้อมูล
  if (profileForm.value.phone && !validatePhone(profileForm.value.phone)) {
    profileMessage.value = {
      type: "error",
      text: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ควรเป็น 08x-xxx-xxxx)",
    };
    profileLoading.value = false;
    return; // หยุดการทำงานถ้าไม่ผ่าน
  }

  // 2. ส่งข้อมูลไปยัง API
  const { error } = await updateUserProfile(user.value.id, {
    full_name: profileForm.value.full_name,
    phone: profileForm.value.phone,
    address: profileForm.value.address,
  });

  // 3. จัดการ Response
  if (error) {
    profileMessage.value = {
      type: "error",
      text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
    };
  } else {
    profileMessage.value = {
      type: "success",
      text: "บันทึกข้อมูลสำเร็จ",
    };
  }

  profileLoading.value = false;

  // ล้างข้อความแจ้งเตือนอัตโนมัติ
  setTimeout(() => {
    profileMessage.value = null;
  }, 3000);
};


const validatePassword = (password: string) => {
  // Regex นี้ตรวจสอบ:
  // 1. ต้องเป็นภาษาอังกฤษ (a-z, A-Z), ตัวเลข (0-9) หรือสัญลักษณ์พิเศษเท่านั้น
  // 2. ห้ามมีภาษาไทย
  // 3. ความยาว 6-20 ตัวอักษร
  const passwordRegex = /^[a-zA-Z0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/-]{6,20}$/;
  return passwordRegex.test(password);
};
const changePasswordHandler = async () => {
  // ดักที่ 1: เช็คว่ารหัสผ่านใหม่กับยืนยันตรงกันไหม
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordMessage.value = {
      type: 'error',
      text: 'รหัสผ่านยืนยันไม่ตรงกัน'
    }
    return
  }

  // ดักที่ 2: เช็คภาษาและรูปแบบ (ดักภาษาไทยออกที่นี่)
  if (!validatePassword(passwordForm.value.newPassword)) {
    passwordMessage.value = {
      type: 'error',
      text: 'รหัสผ่านต้องเป็นภาษาอังกฤษหรือตัวเลข 6 ตัวขึ้นไป (ห้ามใช้ภาษาไทย)'
    }
    return
  }

  // ถ้าผ่านการดักข้างบน ถึงจะเริ่มทำงานต่อ
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
    // ล้างฟอร์มเมื่อสำเร็จ
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
  shopLoading.value = true;
  shopMessage.value = null;

  const { error } = await updateShopSettings(shopForm.value);

  if (error) {
    shopMessage.value = {
      type: "error",
      text: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
    };
  } else {
    shopMessage.value = {
      type: "success",
      text: "บันทึกข้อมูลสำเร็จ",
    };
  }

  shopLoading.value = false;

  setTimeout(() => {
    shopMessage.value = null;
  }, 3000);
};

const saveNotifications = async () => {
  notifyLoading.value = true;
  notifyMessage.value = null;

  const { error } = await updateShopSettings(notifyForm.value);

  if (error) {
    notifyMessage.value = {
      type: "error",
      text: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า",
    };
  } else {
    notifyMessage.value = {
      type: "success",
      text: "บันทึกการตั้งค่าสำเร็จ",
    };
  }

  notifyLoading.value = false;

  setTimeout(() => {
    notifyMessage.value = null;
  }, 3000);
};

const saveSystem = async () => {
  systemLoading.value = true;
  systemMessage.value = null;

  const { error } = await updateShopSettings(systemForm.value);

  if (error) {
    systemMessage.value = {
      type: "error",
      text: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่า",
    };
  } else {
    systemMessage.value = {
      type: "success",
      text: "บันทึกการตั้งค่าสำเร็จ",
    };
  }

  systemLoading.value = false;

  setTimeout(() => {
    systemMessage.value = null;
  }, 3000);
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

onMounted(() => {
  loadProfile();
  loadShopSettings();
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
</style>
