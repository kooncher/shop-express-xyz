<template>
  <div v-if="!checking" class="register-container">
    <div class="register-card">
      <div class="register-header">
        <div class="logo">
          <span class="logo-icon">🛍️</span>
          <span class="logo-text">ShopSystem</span>
        </div>
        <h1 class="register-title">สมัครสมาชิก</h1>
        <p class="register-subtitle">เริ่มต้นใช้งานฟรี ไม่ต้องใช้บัตรเครดิต</p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="fullName" class="form-label">ชื่อ-นามสกุล</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              id="fullName"
              v-model="fullName"
              type="text"
              class="form-input"
              placeholder="กรอกชื่อ-นามสกุล"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">อีเมล</label>
          <div class="input-wrapper">
            <span class="input-icon">📧</span>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">รหัสผ่าน</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              minlength="6"
              required
            />
          </div>
          <p class="form-hint">รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร</p>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">ยืนยันรหัสผ่าน</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
              minlength="6"
              required
            />
          </div>
        </div>

        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="success-message">
          <span class="success-icon">✓</span>
          {{ successMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="btn-submit">
          <span v-if="isLoading" class="loading">
            <span class="spinner"></span>
            กำลังสมัครสมาชิก...
          </span>
          <span v-else>สมัครสมาชิก</span>
        </button>
      </form>

      <div class="register-footer">
        <p>มีบัญชีอยู่แล้ว? <NuxtLink to="/login" class="link">เข้าสู่ระบบ</NuxtLink></p>
      </div>
    </div>

    <!-- Background Decoration -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>
  <LoadingScreen v-else />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signUp, user, initAuth } = useAuth()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const checking = ref(true)

// ตรวจสอบว่ามี session อยู่แล้วหรือไม่
onMounted(async () => {
  await initAuth()
  
  if (user.value) {
    navigateTo('/dashboard', { replace: true })
  } else {
    checking.value = false
  }
})

const handleRegister = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // 1. Trim ข้อมูลทั้งหมดก่อนเริ่มตรวจ
    const cleanFullName = fullName.value.trim()
    const cleanEmail = email.value.trim()
    const cleanPassword = password.value
    const cleanConfirm = confirmPassword.value

    // 2. Validate ชื่อ
    if (cleanFullName.length < 3) {
      errorMessage.value = 'กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน'
      return
    }

    // 3. Validate อีเมลด้วย Regex (สำคัญมาก)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      errorMessage.value = 'รูปแบบอีเมลไม่ถูกต้อง'
      return
    }

    // 4. Validate รหัสผ่าน
    if (cleanPassword.length < 6) {
      errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      return
    }

    if (cleanPassword !== cleanConfirm) {
      errorMessage.value = 'รหัสผ่านไม่ตรงกัน'
      return
    }

    const { data, error } = await signUp(email.value, password.value, fullName.value)

    if (error) {
      // แปลข้อความ error
      if (error.message?.includes('already registered')) {
        errorMessage.value = 'อีเมลนี้ถูกใช้งานแล้ว'
      } else if (error.message?.includes('Invalid email')) {
        errorMessage.value = 'รูปแบบอีเมลไม่ถูกต้อง'
      } else if (error.message?.includes('Password')) {
        errorMessage.value = 'รหัสผ่านไม่ถูกต้อง'
      } else {
        errorMessage.value = error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
      }
      return
    }

    if (data) {
      successMessage.value = 'สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...'
      
      setTimeout(() => {
        navigateTo('/dashboard', { replace: true })
      }, 1500)
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'เกิดข้อผิดพลาด'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.register-card {
  background: white;
  border-radius: 1.5rem;
  padding: 3rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.register-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 2.5rem;
}

.logo-text {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.register-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.register-form {
  display: flex;
  flex-direction: column;
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

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.25rem;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  transition: all 0.2s;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.75rem;
  color: #991b1b;
  font-size: 0.875rem;
  animation: shake 0.4s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.error-icon {
  font-size: 1.25rem;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 0.75rem;
  color: #065f46;
  font-size: 0.875rem;
  animation: slideDown 0.4s;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #059669;
  color: white;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: bold;
}

.btn-submit {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.register-footer {
  margin-top: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Background Decoration */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 1;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  right: -200px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  bottom: -150px;
  left: -150px;
  animation-delay: 7s;
}

.circle-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: -100px;
  animation-delay: 14s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .register-container {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }
}
</style>