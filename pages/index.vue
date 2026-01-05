<template>
  <div class="landing">
    <!-- Nav -->
    <nav :class="{ scrolled: isScrolled }">
      <div class="nav-inner">
        <div class="brand">
          <div class="brand-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)"/>
              <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
                  <stop stop-color="#3b82f6"/>
                  <stop offset="1" stop-color="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span>ShopExpressXYZ</span>
        </div>
        <div class="nav-links">
          <a href="#features">ฟีเจอร์</a>
          <NuxtLink to="/login">เข้าสู่ระบบ</NuxtLink>
          <NuxtLink to="/register" class="btn-signup">เริ่มต้นฟรี</NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="gradient-orb orb-1"></div>
        <div class="gradient-orb orb-2"></div>
        <div class="grid-pattern"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-text">
          <div class="badge">
            <span class="badge-dot"></span>
            ใหม่! รองรับหลายสาขา
          </div>
          <h1>
            จัดการร้านค้า
            <span class="highlight">อย่างมืออาชีพ</span>
          </h1>
          <p class="hero-desc">
            ระบบจัดการสินค้า คำสั่งซื้อ และลูกค้าที่ใช้งานง่าย 
            ออกแบบมาเพื่อธุรกิจไทยโดยเฉพาะ
          </p>
          
          <div class="hero-cta">
            <NuxtLink to="/register" class="btn-primary">
              <span>เริ่มต้นใช้งานฟรี</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </NuxtLink>
            <button class="btn-secondary" @click="scrollToFeatures">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none"/>
              </svg>
              <span>ดูวิธีใช้งาน</span>
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-number" ref="statShops">0</span>
              <span class="stat-label">ร้านค้าที่ใช้งาน</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number" ref="statOrders">0</span>
              <span class="stat-label">ออเดอร์ต่อเดือน</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-number">99.9%</span>
              <span class="stat-label">Uptime</span>
            </div>
          </div>
        </div>
        
        <!-- Dashboard Preview -->
        <div class="preview-container">
          <div class="preview-window">
            <div class="preview-header">
              <div class="window-controls">
                <span class="control close"></span>
                <span class="control minimize"></span>
                <span class="control maximize"></span>
              </div>
              <div class="window-title">ShopExpressXYZ - Dashboard</div>
            </div>
            
            <div class="preview-body">
              <div class="preview-sidebar">
                <div class="sidebar-logo">🛒</div>
                <div class="sidebar-menu">
                  <div class="menu-item active">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  </div>
                  <div class="menu-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                  </div>
                  <div class="menu-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  <div class="menu-item">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div class="preview-main">
                <div class="preview-top">
                  <h3 class="preview-title">ภาพรวมวันนี้</h3>
                  <div class="preview-date">{{ currentDate }}</div>
                </div>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <div class="stat-card-icon blue">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                    <div class="stat-card-info">
                      <span class="stat-card-value">฿{{ animatedSales.toLocaleString() }}</span>
                      <span class="stat-card-label">ยอดขายวันนี้</span>
                    </div>
                    <span class="stat-card-trend up">+18%</span>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-card-icon green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                      </svg>
                    </div>
                    <div class="stat-card-info">
                      <span class="stat-card-value">{{ animatedOrders }}</span>
                      <span class="stat-card-label">คำสั่งซื้อใหม่</span>
                    </div>
                    <span class="stat-card-trend up">+5</span>
                  </div>
                  
                  <div class="stat-card">
                    <div class="stat-card-icon purple">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="stat-card-info">
                      <span class="stat-card-value">{{ animatedCustomers }}</span>
                      <span class="stat-card-label">ลูกค้าใหม่</span>
                    </div>
                    <span class="stat-card-trend up">+12</span>
                  </div>
                </div>
                
                <!-- Chart -->
                <div class="chart-container">
                  <div class="chart-header">
                    <span class="chart-title">ยอดขาย 7 วันล่าสุด</span>
                    <span class="chart-total">฿{{ weeklyTotal.toLocaleString() }}</span>
                  </div>
                  <div class="chart-area">
                    <div class="chart-bars">
                      <div 
                        v-for="(bar, i) in chartBars" 
                        :key="i" 
                        class="chart-bar-wrapper"
                      >
                        <div 
                          class="chart-bar" 
                          :style="{ height: bar.height + '%' }"
                        >
                          <span class="bar-tooltip">฿{{ bar.value.toLocaleString() }}</span>
                        </div>
                        <span class="bar-label">{{ bar.day }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Recent Orders -->
                <div class="orders-container">
                  <div class="orders-header">
                    <span class="orders-title">คำสั่งซื้อล่าสุด</span>
                  </div>
                  <div class="orders-list">
                    <div class="order-item" v-for="order in recentOrders" :key="order.id">
                      <div class="order-info">
                        <span class="order-id">{{ order.id }}</span>
                        <span class="order-customer">{{ order.customer }}</span>
                      </div>
                      <span class="order-amount">฿{{ order.amount.toLocaleString() }}</span>
                      <span :class="['order-status', order.status]">{{ order.statusText }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating Notifications -->
          <div class="float-notification notif-1">
            <div class="notif-icon success">✓</div>
            <div class="notif-content">
              <span class="notif-title">ออเดอร์สำเร็จ!</span>
              <span class="notif-desc">+฿1,850 จาก คุณสมศรี</span>
            </div>
          </div>
          
          <div class="float-notification notif-2">
            <div class="notif-icon warning">📦</div>
            <div class="notif-content">
              <span class="notif-title">สินค้าใกล้หมด</span>
              <span class="notif-desc">เสื้อยืดสีขาว เหลือ 3 ชิ้น</span>
            </div>
          </div>
          
          <div class="float-notification notif-3">
            <div class="notif-icon info">👤</div>
            <div class="notif-content">
              <span class="notif-title">ลูกค้าใหม่</span>
              <span class="notif-desc">คุณวิชัย สมัครสมาชิก</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trusted By -->
    <section class="trusted">
      <div class="trusted-inner">
        <p class="trusted-label">ได้รับความไว้วางใจจากธุรกิจชั้นนำ</p>
        <div class="trusted-logos">
          <div class="logo-item">🏪 ร้านค้าออนไลน์</div>
          <div class="logo-item">👗 แฟชั่น</div>
          <div class="logo-item">🍜 อาหาร</div>
          <div class="logo-item">💄 ความงาม</div>
          <div class="logo-item">📱 อิเล็กทรอนิกส์</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="features" class="features">
      <div class="section-header">
        <span class="section-tag">ฟีเจอร์</span>
        <h2>ทุกอย่างที่ต้องการ<br/><span class="highlight">จัดการได้ในที่เดียว</span></h2>
        <p>ออกแบบมาให้ใช้งานง่าย ไม่ต้องเป็น IT ก็ใช้ได้</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" v-for="(feature, i) in features" :key="i">
          <div :class="['feature-icon', feature.color]">
            <span>{{ feature.icon }}</span>
          </div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.desc }}</p>
          <ul class="feature-list">
            <li v-for="(item, j) in feature.items" :key="j">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>



    <!-- CTA -->
    <section class="cta">
      <div class="cta-bg">
        <div class="cta-gradient"></div>
      </div>
      <div class="cta-content">
        <h2>พร้อมยกระดับธุรกิจของคุณ?</h2>
        <p>เริ่มต้นใช้งานฟรีวันนี้ ไม่ต้องผูกบัตรเครดิต</p>
        <div class="cta-buttons">
          <NuxtLink to="/register" class="btn-cta-primary">
            สมัครฟรี — ใช้ได้เลย
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
        <p class="cta-note">✓ ฟรีตลอดชีพสำหรับร้านค้าเล็ก ✓ ไม่มีค่าธรรมเนียมแอบแฝง</p>
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="brand">
            <div class="brand-logo">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#logo-grad-footer)"/>
                <path d="M8 10h12M8 14h8M8 18h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                <defs>
                  <linearGradient id="logo-grad-footer" x1="0" y1="0" x2="28" y2="28">
                    <stop stop-color="#3b82f6"/>
                    <stop offset="1" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span>ShopExpressXYZ</span>
          </div>
          <p>ระบบจัดการร้านค้าออนไลน์ที่ดีที่สุดสำหรับธุรกิจไทย</p>
        </div>
        <div class="footer-links">
          <div class="footer-col">
            <h4>ผลิตภัณฑ์</h4>
            <a href="#features">ฟีเจอร์</a>
            <a href="#testimonials">รีวิว</a>
          </div>
          <div class="footer-col">
            <h4>บริษัท</h4>
            <a href="#">เกี่ยวกับเรา</a>
            <a href="#">ติดต่อ</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2024 ShopExpressXYZ. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { user, initAuth } = useAuth()

// State
const isScrolled = ref(false)
const animatedSales = ref(0)
const animatedOrders = ref(0)
const animatedCustomers = ref(0)

// Data
const currentDate = computed(() => {
  return new Date().toLocaleDateString('th-TH', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
})

const chartBars = ref([
  { day: 'จ', value: 12400, height: 0 },
  { day: 'อ', value: 18200, height: 0 },
  { day: 'พ', value: 15800, height: 0 },
  { day: 'พฤ', value: 22100, height: 0 },
  { day: 'ศ', value: 28500, height: 0 },
  { day: 'ส', value: 35200, height: 0 },
  { day: 'อา', value: 24600, height: 0 },
])

const weeklyTotal = computed(() => {
  return chartBars.value.reduce((sum, bar) => sum + bar.value, 0)
})

const recentOrders = [
  { id: 'ORD-001', customer: 'คุณสมศรี', amount: 1850, status: 'success', statusText: 'สำเร็จ' },
  { id: 'ORD-002', customer: 'คุณวิชัย', amount: 3200, status: 'pending', statusText: 'รอจัดส่ง' },
  { id: 'ORD-003', customer: 'คุณนภา', amount: 890, status: 'success', statusText: 'สำเร็จ' },
]

const features = [
  {
    icon: '📦',
    title: 'จัดการสินค้า',
    desc: 'ระบบจัดการสินค้าที่ครบครัน',
    color: 'blue',
    items: ['เพิ่ม/แก้ไขสินค้าง่าย', 'ติดตามสต็อกอัตโนมัติ', 'แจ้งเตือนสินค้าใกล้หมด']
  },
  {
    icon: '🛒',
    title: 'คำสั่งซื้อ',
    desc: 'จัดการออเดอร์แบบเรียลไทม์',
    color: 'green',
    items: ['รับออเดอร์ทันที', 'อัพเดทสถานะง่าย', 'พิมพ์ใบเสร็จ/ใบส่งของ']
  },
  {
    icon: '👥',
    title: 'ข้อมูลลูกค้า',
    desc: 'บริหารความสัมพันธ์ลูกค้า',
    color: 'purple',
    items: ['บันทึกประวัติการซื้อ', 'แบ่งกลุ่มลูกค้า', 'วิเคราะห์พฤติกรรม']
  },
  {
    icon: '📊',
    title: 'รายงาน',
    desc: 'วิเคราะห์ธุรกิจด้วยข้อมูล',
    color: 'orange',
    items: ['กราฟยอดขาย', 'สินค้าขายดี Top 10', 'รายงานกำไร/ขาดทุน']
  }
]


// Animation functions
const animateValue = (ref: Ref<number>, target: number, duration: number) => {
  const start = 0
  const startTime = performance.now()
  
  const update = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    ref.value = Math.floor(start + (target - start) * easeOut)
    
    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }
  
  requestAnimationFrame(update)
}

const animateChart = () => {
  const maxValue = Math.max(...chartBars.value.map(b => b.value))
  chartBars.value.forEach((bar, i) => {
    setTimeout(() => {
      bar.height = (bar.value / maxValue) * 100
    }, i * 100)
  })
}

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

// Lifecycle
onMounted(async () => {
  await initAuth()
  if (user.value) {
    navigateTo('/dashboard')
    return
  }
  
  // Scroll handler
  window.addEventListener('scroll', () => {
    isScrolled.value = window.scrollY > 50
  })
  
  // Start animations
  setTimeout(() => {
    animateValue(animatedSales, 48250, 2000)
    animateValue(animatedOrders, 24, 1500)
    animateValue(animatedCustomers, 18, 1500)
    animateChart()
  }, 500)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700;800&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing {
  font-family: 'Noto Sans Thai', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #fafbfc;
  color: #0f172a;
  overflow-x: hidden;
  line-height: 1.6;
}

/* Utilities */
.highlight {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  transition: all 0.3s ease;
}

nav.scrolled {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.06);
}

.nav-inner {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
}

.brand-logo {
  display: flex;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.nav-links a {
  padding: 0.6rem 1rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 10px;
  transition: all 0.2s;
}

.nav-links a:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.04);
}

.btn-signup {
  background: linear-gradient(135deg, #3b82f6, #6366f1) !important;
  color: white !important;
  margin-left: 0.5rem;
}

.btn-signup:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  padding: 8rem 2rem 4rem;
  display: flex;
  align-items: center;
}

.hero-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: linear-gradient(135deg, #dbeafe, #e0e7ff);
  top: -200px;
  right: -100px;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, #fae8ff, #dbeafe);
  bottom: -100px;
  left: -100px;
}

.grid-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
  background-size: 60px 60px;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 4rem;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 100px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid #dbeafe;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-text h1 {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 1.25rem;
}

.hero-desc {
  font-size: 1.15rem;
  color: #64748b;
  margin-bottom: 2rem;
  max-width: 480px;
  line-height: 1.7;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.75rem;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  color: #374151;
  font-weight: 600;
  font-size: 1rem;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.stat-label {
  font-size: 0.85rem;
  color: #64748b;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

/* Preview */
.preview-container {
  position: relative;
}

.preview-window {
  background: white;
  border-radius: 20px;
  box-shadow: 
    0 0 0 1px rgba(0, 0, 0, 0.05),
    0 25px 80px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.window-controls {
  display: flex;
  gap: 8px;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e2e8f0;
}

.control.close { background: #f87171; }
.control.minimize { background: #fbbf24; }
.control.maximize { background: #4ade80; }

.window-title {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.preview-body {
  display: flex;
  min-height: 420px;
}

.preview-sidebar {
  width: 60px;
  background: #1e293b;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.sidebar-logo {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.menu-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #94a3b8;
  transition: all 0.2s;
}

.menu-item.active {
  background: #3b82f6;
  color: white;
}

.preview-main {
  flex: 1;
  padding: 1.25rem;
  background: #f8fafc;
}

.preview-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.preview-date {
  font-size: 0.75rem;
  color: #94a3b8;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.stat-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-icon.blue { background: #eff6ff; color: #3b82f6; }
.stat-card-icon.green { background: #f0fdf4; color: #22c55e; }
.stat-card-icon.purple { background: #faf5ff; color: #a855f7; }

.stat-card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-card-label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.stat-card-trend {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 100px;
}

.stat-card-trend.up {
  background: #dcfce7;
  color: #16a34a;
}

/* Chart */
.chart-container {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  margin-bottom: 1rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.chart-total {
  font-size: 0.8rem;
  font-weight: 700;
  color: #3b82f6;
}

.chart-area {
  height: 100px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
  gap: 8px;
}

.chart-bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.chart-bar {
  width: 100%;
  background: linear-gradient(to top, #3b82f6, #60a5fa);
  border-radius: 4px 4px 0 0;
  transition: height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 4px;
}

.chart-bar:hover .bar-tooltip {
  opacity: 1;
  transform: translateY(-5px);
}

.bar-tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: #1e293b;
  color: white;
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  transition: all 0.2s;
  pointer-events: none;
}

.bar-label {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 0.5rem;
}

/* Orders */
.orders-container {
  background: white;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.orders-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.orders-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.orders-list {
  padding: 0.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.order-item:hover {
  background: #f8fafc;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.order-id {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
}

.order-customer {
  font-size: 0.65rem;
  color: #94a3b8;
}

.order-amount {
  font-size: 0.75rem;
  font-weight: 600;
  color: #0f172a;
}

.order-status {
  font-size: 0.6rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 100px;
}

.order-status.success {
  background: #dcfce7;
  color: #16a34a;
}

.order-status.pending {
  background: #fef3c7;
  color: #d97706;
}

/* Float Notifications */
.float-notification {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: white;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  animation: float 5s ease-in-out infinite;
  z-index: 10;
}

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.notif-icon.success { background: #dcfce7; }
.notif-icon.warning { background: #fef3c7; }
.notif-icon.info { background: #eff6ff; }

.notif-content {
  display: flex;
  flex-direction: column;
}

.notif-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
}

.notif-desc {
  font-size: 0.7rem;
  color: #64748b;
}

.notif-1 {
  top: -10px;
  right: 20px;
  animation-delay: 0s;
}

.notif-2 {
  bottom: 120px;
  left: -40px;
  animation-delay: 1.5s;
}

.notif-3 {
  bottom: 20px;
  right: -20px;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12px); }
}

/* Trusted */
.trusted {
  padding: 3rem 2rem;
  background: white;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.trusted-inner {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
}

.trusted-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

.trusted-logos {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.logo-item {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

/* Features */
.features {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-tag {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.1rem;
  color: #64748b;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s;
}

.feature-card:hover {
  border-color: #c7d2fe;
  box-shadow: 0 15px 50px rgba(99, 102, 241, 0.1);
  transform: translateY(-4px);
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 1.25rem;
}

.feature-icon.blue { background: linear-gradient(135deg, #eff6ff, #dbeafe); }
.feature-icon.green { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.feature-icon.purple { background: linear-gradient(135deg, #faf5ff, #f3e8ff); }
.feature-icon.orange { background: linear-gradient(135deg, #fff7ed, #ffedd5); }

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.feature-card > p {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 1.25rem;
}

.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  color: #475569;
}

.feature-list svg {
  color: #22c55e;
  flex-shrink: 0;
}


/* CTA */
.cta {
  position: relative;
  padding: 5rem 2rem;
  margin: 3rem;
  border-radius: 32px;
  overflow: hidden;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1e293b, #0f172a);
}

.cta-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15), transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15), transparent 50%);
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.cta h2 {
  font-size: 2.25rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.75rem;
}

.cta > .cta-content > p {
  font-size: 1.1rem;
  color: #94a3b8;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.btn-cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 1.125rem 2rem;
  background: white;
  color: #0f172a;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.05rem;
  border-radius: 14px;
  transition: all 0.3s;
}

.btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.2);
}

.cta-note {
  font-size: 0.9rem;
  color: #64748b;
}

/* Footer */
footer {
  background: white;
  border-top: 1px solid #e2e8f0;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 4rem 2rem;
  display: flex;
  justify-content: space-between;
  gap: 4rem;
}

.footer-brand {
  max-width: 300px;
}

.footer-brand .brand {
  margin-bottom: 1rem;
}

.footer-brand p {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.6;
}

.footer-links {
  display: flex;
  gap: 4rem;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-col h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.footer-col a {
  font-size: 0.9rem;
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: #3b82f6;
}

.footer-bottom {
  border-top: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  text-align: center;
}

.footer-bottom span {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-desc {
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-cta {
    justify-content: center;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .preview-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .float-notification {
    display: none;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  nav {
    padding: 0.875rem 1rem;
  }
  
  .nav-links a:not(.btn-signup) {
    display: none;
  }
  
  .hero {
    padding: 6rem 1rem 3rem;
  }
  
  .hero-text h1 {
    font-size: 2.25rem;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-divider {
    display: none;
  }
  
  .preview-body {
    flex-direction: column;
  }
  
  .preview-sidebar {
    flex-direction: row;
    width: 100%;
    padding: 0.75rem;
    justify-content: center;
  }
  
  .sidebar-logo {
    margin-bottom: 0;
    margin-right: 1rem;
  }
  
  .sidebar-menu {
    display: flex;
    gap: 0.25rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .features {
    padding: 4rem 1rem;
  }
  
  .section-header h2 {
    font-size: 1.75rem;
  }
  
  .cta {
    margin: 1.5rem 1rem;
    padding: 3rem 1.5rem;
  }
  
  .cta h2 {
    font-size: 1.5rem;
  }
  
  .footer-inner {
    flex-direction: column;
    gap: 2rem;
  }
  
  .footer-links {
    gap: 2rem;
  }
  
  .trusted-logos {
    gap: 1.5rem;
  }
}
</style>