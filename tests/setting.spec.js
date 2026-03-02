import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime' // ใช้ mount ของ Nuxt 3 โดยตรง
import SettingsPage from '../pages/settings/index.vue'
import { ref } from 'vue'

// 1. Mock #imports สำหรับ Nuxt Auto-imports
vi.mock('#imports', () => ({
  definePageMeta: vi.fn(),
  useAuth: () => ({
    user: ref({
      id: 'user123',
      email: 'test@example.com',
      profile: { role: 'customer' },
      user_metadata: { full_name: 'Test User' }
    })
  }),
  useSettings: () => ({
    getUserProfile: vi.fn().mockResolvedValue({ data: {} }),
    updateUserProfile: vi.fn().mockResolvedValue({ error: null }),
    changePassword: vi.fn().mockResolvedValue({ error: null }),
    getShopSettings: vi.fn().mockResolvedValue({ data: {} }),
    updateShopSettings: vi.fn().mockResolvedValue({ error: null }),
  }),
  useCookie: () => ref('customer'),
  // ไม่ต้อง mock ref/computed/onMounted เอง เพราะ @nuxt/test-utils จัดการให้
}))

describe('Settings Page - Logic & Security', () => {

  it('Customer ไม่ควรเห็นแท็บ "ข้อมูลร้าน"', async () => {
    const wrapper = await mountSuspended(SettingsPage) // ใช้ await กับ mountSuspended
    const tabLabels = wrapper.findAll('.tab-label').map(el => el.text())
    
    expect(tabLabels).toContain('โปรไฟล์')
    expect(tabLabels).not.toContain('ข้อมูลร้าน')
  })

  it('เบอร์โทรศัพท์ควรจัดรูปแบบอัตโนมัติ (0812345678 -> 081-234-5678)', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    const phoneInput = wrapper.find('input[type="tel"]')
    
    // จำลองการพิมพ์ (trigger input event)
    await phoneInput.setValue('0812345678')
    
    // ตรวจสอบค่าใน element
    expect(phoneInput.element.value).toBe('081-234-5678')
  })

  it('ต้องแสดง Error เมื่อรหัสผ่านใหม่และยืนยันไม่ตรงกัน', async () => {
    const wrapper = await mountSuspended(SettingsPage)
    
    const inputs = wrapper.findAll('input[type="password"]')
    // สมมติ index 0 = เก่า, 1 = ใหม่, 2 = ยืนยัน (เช็คจากไฟล์จริงของคุณอีกที)
    await inputs[1].setValue('password123')
    await inputs[2].setValue('different-pass')
    
    const submitBtn = wrapper.findAll('button').find(b => b.text().includes('เปลี่ยนรหัสผ่าน'))
    await submitBtn.trigger('click') // หรือ 'submit'

    // รอให้ Vue อัปเดต DOM หลังแสดง Error
    await wrapper.vm.$nextTick()
    
    const errorMessage = wrapper.find('.message.error')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toContain('รหัสผ่านยืนยันไม่ตรงกัน')
  })
})