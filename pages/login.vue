<template>
  <div v-if="!checking" class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">เข้าสู่ระบบ</h1>
        <p class="login-subtitle">ยินดีต้อนรับกลับมา!</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">อีเมล</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">รหัสผ่าน</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </button>
      </form>

      <div class="login-footer">
        <p>ยังไม่มีบัญชี? <NuxtLink to="/register" class="link">สมัครสมาชิก</NuxtLink></p>
      </div>
    </div>
  </div>
  <LoadingScreen v-else />
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signIn, user, initAuth } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
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

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const { data, error: signInError } = await signIn(email.value, password.value)

    if (signInError) {
      error.value = signInError.message || 'เข้าสู่ระบบไม่สำเร็จ'
      return
    }

    if (data && data.user) {
      // 1. ดึง Role จาก metadata ของ user ที่ล็อกอินเข้ามา
      const userRole = data.user.user_metadata?.role || 'customer'
      
      // 2. บันทึกลง Cookie (ตั้งชื่อให้ตรงกับที่ใช้ใน middleware/auth.ts)
      // กำหนด maxAge เป็น 7 วัน
      const roleCookie = useCookie('user-role', { maxAge: 60 * 60 * 24 * 7 })
      roleCookie.value = userRole

      // 3. นำทางไปยัง Dashboard
      navigateTo('/dashboard', { replace: true })
    }
  } catch (err: any) {
    error.value = err.message || 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.form-input {
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #991b1b;
  font-size: 0.875rem;
}

.btn-submit {
  padding: 0.875rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}
</style>