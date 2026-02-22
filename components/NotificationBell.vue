<template>
  <div class="notification-wrapper">
    <button class="nav-icon-btn" @click="showDropdown = !showDropdown">
      <span class="icon">🔔</span>
      <span v-if="hasNewOrder" class="dot"></span>
    </button>

    <Transition name="slide-fade">
      <div v-if="showDropdown" class="notification-dropdown">

        <div class="mobile-handle-bar"></div>
       <div v-for="order in recentOrders" :key="order.id" 
     class="notification-item" @click="handleItemClick(order.id)">
  <div class="item-icon">📦</div>
  <div class="item-info">
    <p class="order-id" style="font-weight: bold; margin: 0;">#{{ order.order_number }}</p>
    <p class="order-customer" style="font-size: 0.8rem; color: #64748b; margin: 0;">
      {{ order.customer_name || 'ลูกค้าทั่วไป' }}
    </p>
  </div>
  <div class="order-amount" style="margin-left: auto; font-weight: bold; color: #10b981;">
    ฿{{ order.total_amount?.toLocaleString() }}
  </div>
</div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { recentOrders, hasNewOrder, fetchOrders, setupRealtime } = useNotifications()
const showDropdown = ref(false)
const router = useRouter()

const handleItemClick = (id: string) => {
  showDropdown.value = false
  hasNewOrder.value = false
  router.push({ path: '/orders', query: { openId: id } })
}

onMounted(() => {
  fetchOrders()
  const channel = setupRealtime()
  onUnmounted(() => useNuxtApp().$supabase.removeChannel(channel))
})
</script>
<style scoped>
/* Container สำหรับจัดวางใน Navbar */
.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

/* ปุ่มกระดิ่ง */
.nav-icon-btn {
  background: none;
  border: none;
  color: #94a3b8; /* สีเทาฟ้าให้เข้ากับ Navbar */
  font-size: 1.4rem;
  cursor: pointer;
  position: relative;
  padding: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.nav-icon-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* จุดแจ้งเตือนสีแดง */
.dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 10px;
  height: 10px;
  background: #ef4444; /* สีแดงสว่าง */
  border-radius: 50%;
  border: 2px solid #1e293b; /* ขอบสีเดียวกับ Navbar */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Dropdown */
.notification-dropdown {
  position: absolute;
  top: calc(100% + 15px);
  right: 0;
  width: 320px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 1000;
  color: #1e293b;
  overflow: hidden;
}

/* รายการออเดอร์ใน Dropdown */
.notification-item {
  display: flex;
  padding: 12px 16px;
  gap: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #f8fafc;
}

.notification-item:last-child {
  border-bottom: none;
}

/* Animation */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}




@media (max-width: 768px) {
  .notification-dropdown {
    position: fixed; /* ลอยเหนือทุกอย่าง */
    top: auto;
    bottom: 0; /* เปลี่ยนมาเด้งขึ้นจากข้างล่าง หรือลอยกลางจอ */
    left: 0;
    right: 0;
    width: 100%; /* เต็มความกว้างจอ */
    border-radius: 20px 20px 0 0; /* มนแค่ด้านบนเหมือนแอปมือถือ */
    margin: 0;
    max-height: 70vh;
    z-index: 9999;
  }
}





/* สไตล์เริ่มต้น (ซ่อนไว้ก่อนในคอม) */
.mobile-handle-bar {
  display: none;
}

@media (max-width: 768px) {
  .mobile-handle-bar {
    display: block;
    width: 40px;      /* ความกว้างของขีด */
    height: 4px;      /* ความหนาของขีด */
    background: #e2e8f0; /* สีเทาอ่อนๆ ไม่แย่งสายตา */
    border-radius: 2px;
    margin: 12px auto 8px auto; /* จัดให้อยู่กึ่งกลางบนสุด */
  }

  .notification-dropdown {
    /* ปรับ padding-top เพิ่มเล็กน้อยเพื่อให้ Handle Bar มีที่ว่าง */
    padding-top: 4px;
    border-radius: 20px 20px 0 0; /* ทำให้มุมบนมนรับกับ Handle Bar */
  }
}
</style>