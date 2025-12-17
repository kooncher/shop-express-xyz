<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <!-- Navigation -->
        <nav class="nav-bar">
          <div class="nav-brand">
            <span class="brand-icon">🛍️</span>
            <span class="brand-name">ShopSystem</span>
          </div>
          <div class="nav-actions">
            <NuxtLink to="/login" class="btn-login">เข้าสู่ระบบ</NuxtLink>
            <NuxtLink to="/register" class="btn-register">สมัครฟรี</NuxtLink>
          </div>
        </nav>

        <!-- Hero Content -->
        <div class="hero-main">
          <div class="hero-text">
            <div class="badge">✨ ระบบจัดการร้านค้าออนไลน์</div>
            <h1 class="hero-title">
              จัดการธุรกิจของคุณ<br/>
              <span class="gradient-text">ได้ง่ายขึ้นกว่าเดิม</span>
            </h1>
            <p class="hero-subtitle">
              ระบบจัดการร้านค้าออนไลน์ที่ครบครัน จัดการสินค้า คำสั่งซื้อ และลูกค้าได้อย่างมีประสิทธิภาพ
            </p>
            <div class="hero-buttons">
              <NuxtLink to="/register" class="btn-primary">
                <span>เริ่มต้นใช้งานฟรี</span>
                <span class="arrow">→</span>
              </NuxtLink>
              <button class="btn-demo">
                <span class="play-icon">▶</span>
                <span>ดูการใช้งาน</span>
              </button>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <p class="stat-number">1,000+</p>
                <p class="stat-label">ร้านค้าที่ใช้งาน</p>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <p class="stat-number">50K+</p>
                <p class="stat-label">คำสั่งซื้อต่อเดือน</p>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <p class="stat-number">99.9%</p>
                <p class="stat-label">ความพึงพอใจ</p>
              </div>
            </div>
          </div>
          <div class="hero-image">
            <div class="dashboard-preview">
              <div class="preview-header">
                <div class="preview-dots">
                  <span class="dot red"></span>
                  <span class="dot yellow"></span>
                  <span class="dot green"></span>
                </div>
              </div>
              <div class="preview-content">
                <div class="preview-card" style="animation-delay: 0s">
                  <div class="card-icon">📊</div>
                  <div class="card-text">
                    <p class="card-title">Dashboard</p>
                    <p class="card-subtitle">ภาพรวมธุรกิจ</p>
                  </div>
                </div>
                <div class="preview-card" style="animation-delay: 0.2s">
                  <div class="card-icon">📦</div>
                  <div class="card-text">
                    <p class="card-title">สินค้า</p>
                    <p class="card-subtitle">จัดการสต็อก</p>
                  </div>
                </div>
                <div class="preview-card" style="animation-delay: 0.4s">
                  <div class="card-icon">🛒</div>
                  <div class="card-text">
                    <p class="card-title">คำสั่งซื้อ</p>
                    <p class="card-subtitle">ติดตามออเดอร์</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Animated Background -->
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">ฟีเจอร์ครบครัน เพื่อธุรกิจของคุณ</h2>
          <p class="section-subtitle">ทุกสิ่งที่คุณต้องการในที่เดียว</p>
        </div>

        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📦</div>
            <h3 class="feature-title">จัดการสินค้า</h3>
            <p class="feature-desc">เพิ่ม แก้ไข ลบสินค้าได้ง่าย พร้อมระบบจัดการสต็อกอัตโนมัติ</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🛒</div>
            <h3 class="feature-title">ระบบคำสั่งซื้อ</h3>
            <p class="feature-desc">ติดตามและจัดการคำสั่งซื้อได้แบบเรียลไทม์</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3 class="feature-title">ฐานข้อมูลลูกค้า</h3>
            <p class="feature-desc">จัดการข้อมูลลูกค้าและประวัติการซื้อครบถ้วน</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3 class="feature-title">รายงานและวิเคราะห์</h3>
            <p class="feature-desc">ดูสถิติและรายงานยอดขายได้แบบละเอียด</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🔔</div>
            <h3 class="feature-title">แจ้งเตือนอัตโนมัติ</h3>
            <p class="feature-desc">รับการแจ้งเตือนเมื่อมีคำสั่งซื้อใหม่หรือสต็อกใกล้หมด</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3 class="feature-title">ใช้งานได้ทุกที่</h3>
            <p class="feature-desc">รองรับทุกอุปกรณ์ ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">พร้อมเริ่มต้นแล้วหรือยัง?</h2>
          <p class="cta-subtitle">สมัครเลยวันนี้และรับฟรี 30 วัน ไม่ต้องใช้บัตรเครดิต</p>
          <NuxtLink to="/register" class="btn-cta">
            เริ่มใช้งานฟรี
            <span class="arrow">→</span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-brand">
            <span class="brand-icon">🛍️</span>
            <span class="brand-name">ShopSystem</span>
          </div>
          <p class="footer-text">© 2024 ShopSystem. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { user, initAuth } = useAuth()

onMounted(async () => {
  await initAuth()
  
  if (user.value) {
    navigateTo('/dashboard')
  }
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  min-height: 100vh;
  background: #ffffff;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 10;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navigation */
.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 0;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.brand-icon {
  font-size: 2rem;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.btn-login {
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.3s;
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-register {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  border-radius: 0.5rem;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Hero Main */
.hero-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 0;
  min-height: calc(100vh - 120px);
}

.hero-text {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  color: white;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.gradient-text {
  background: linear-gradient(to right, #ffd89b, #19547b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.8;
  margin-bottom: 2.5rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.btn-primary .arrow {
  transition: transform 0.3s;
}

.btn-primary:hover .arrow {
  transform: translateX(5px);
}

.btn-demo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 1.125rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-demo:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.play-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  color: #667eea;
  border-radius: 50%;
  font-size: 0.75rem;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-item {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.3);
}

/* Hero Image */
.hero-image {
  animation: fadeInRight 0.8s ease-out 0.3s both;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.dashboard-preview {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 1.5rem;
  padding: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.preview-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  animation: slideIn 0.6s ease-out both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-icon {
  font-size: 2.5rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Background Shapes */
.bg-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: -150px;
  right: -150px;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: -100px;
  animation-delay: 5s;
}

.shape-3 {
  width: 250px;
  height: 250px;
  top: 50%;
  right: 10%;
  animation-delay: 10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.feature-desc {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.7;
}

/* CTA Section */
.cta-section {
  padding: 6rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.cta-content {
  text-align: center;
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 2.5rem;
  background: white;
  color: #667eea;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

/* Footer */
.footer {
  padding: 3rem 0;
  background: #1f2937;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.footer-text {
  color: #9ca3af;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-main {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .hero-title {
    font-size: 3rem;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-buttons {
    flex-direction: column;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-divider {
    display: none;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .nav-actions {
    flex-direction: column;
  }
}
</style>