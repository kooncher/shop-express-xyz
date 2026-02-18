<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h2>
        <button @click="$emit('close')" class="btn-close">✕</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Image Upload -->
        <div class="form-group">
          <label class="form-label">รูปภาพสินค้า</label>
          <div class="image-upload-container">
            <div v-if="imagePreview || form.image_url" class="image-preview">
              <img :src="imagePreview || form.image_url" alt="Product preview" />
              <button 
                type="button" 
                @click="removeImage" 
                class="btn-remove-image"
                title="ลบรูปภาพ"
              >
                ✕
              </button>
            </div>
            <div v-else class="upload-placeholder">
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                class="file-input"
              />
              <div class="upload-content">
                <span class="upload-icon">📷</span>
                <p>คลิกเพื่อเลือกรูปภาพ</p>
                <p class="upload-hint">PNG, JPG, GIF (สูงสุด 2MB)</p>
              </div>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">ชื่อสินค้า</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="กรอกชื่อสินค้า"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">SKU</label>
            <input
              v-model="form.sku"
              type="text"
              class="form-input"
              @input="validateSKU"
              placeholder="SKU-001"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">รายละเอียด</label>
          <textarea
            v-model="form.description"
            class="form-textarea"
            rows="3"
            placeholder="รายละเอียดสินค้า..."
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">หมวดหมู่</label>
            <select v-model="form.category_id" class="form-select" required>
              <option value="">เลือกหมวดหมู่</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label required">ราคา (฿)</label>
            <input
              v-model.number="form.price"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label required">สต็อก</label>
            <input
              v-model.number="form.stock"
              type="number"
              min="0"
              class="form-input"
              placeholder="0"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">สต็อกขั้นต่ำ</label>
            <input
              v-model.number="form.min_stock"
              type="number"
              min="0"
              class="form-input"
              placeholder="5"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="form.is_active" type="checkbox" class="checkbox" />
            <span>เปิดใช้งานสินค้า</span>
          </label>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn-secondary">
            ยกเลิก
          </button>
          <button type="submit" :disabled="loading" class="btn-primary">
            <span v-if="loading" class="spinner-small"></span>
            <span v-else>{{ isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: Object,
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

// ใช้ supabase จาก plugin
const { $supabase } = useNuxtApp()

const isEdit = computed(() => !!props.product)
const loading = ref(false)
const fileInput = ref(null)
const imageFile = ref(null)
const imagePreview = ref('')

const form = ref({
  name: '',
  sku: '',
  description: '',
  category_id: '',
  price: 0,
  stock: 0,
  min_stock: 5,
  image_url: '',
  image_path: '',
  is_active: true
})

// Initialize form with product data if editing
if (props.product) {
  form.value = {
    name: props.product.name || '',
    sku: props.product.sku || '',
    description: props.product.description || '',
    category_id: props.product.category_id || '',
    price: props.product.price || 0,
    stock: props.product.stock || 0,
    min_stock: props.product.min_stock || 5,
    image_url: props.product.image_url || '',
    image_path: props.product.image_path || '',
    is_active: props.product.is_active ?? true
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files?.[0]
  
  if (file) {
    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('ไฟล์มีขนาดใหญ่เกิน 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น')
      return
    }

    imageFile.value = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  form.value.image_url = ''
  form.value.image_path = ''
  
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadImage = async (file, productId) => {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${productId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `products/${fileName}`

    const { data, error} = await $supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    const { data: { publicUrl } } = $supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return { url: publicUrl, path: filePath }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

const deleteImage = async (filePath) => {
  try {
    const { error } = await $supabase.storage
      .from('product-images')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}
const skuError = ref(false);

const validateSKU = (event) => {
  // 1. กรองทิ้งเฉพาะภาษาไทย (ช่วง ก-๙)
  // ส่วนอักขระพิเศษอื่นๆ (เช่น @, #, $, %, ! , ฯลฯ) จะยังอยู่ครบ
  const filteredValue = event.target.value.replace(/[ก-๙]/g, '');
  
  // 2. อัปเดตลงในตัวแปร form
  form.value.sku = filteredValue;
  
  // 3. บังคับอัปเดตค่าในช่อง Input ที่หน้าจอทันที
  event.target.value = filteredValue;

  // 4. แจ้งเตือนถ้ามีการพยายามพิมพ์ไทย
  const thaiRegex = /[ก-๙]/;
  skuError.value = thaiRegex.test(event.target.value);
};

const handleSubmit = async () => {
  loading.value = true

  try {
    let imageUrl = form.value.image_url
    let imagePath = form.value.image_path

    // Upload new image if selected
    if (imageFile.value) {
      // Delete old image if exists
      if (imagePath) {
        await deleteImage(imagePath)
      }

      const uploadResult = await uploadImage(imageFile.value, props.product?.id)
      imageUrl = uploadResult.url
      imagePath = uploadResult.path
    }

    const productData = {
      name: form.value.name,
      sku: form.value.sku || null,
      description: form.value.description || null,
      category_id: form.value.category_id || null,
      price: parseFloat(form.value.price) || 0,
      stock: parseInt(form.value.stock) || 0,
      min_stock: parseInt(form.value.min_stock) || 5,
      image_url: imageUrl || null,
      image_path: imagePath || null,
      is_active: form.value.is_active
    }

    let result
    if (isEdit.value) {
      // Update existing product
      const { data, error } = await $supabase
        .from('products')
        .update(productData)
        .eq('id', props.product.id)
        .select()
        .single()

      result = { data, error }
    } else {
      // Create new product
      const { data, error } = await $supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      result = { data, error }
    }

    if (result.error) {
      throw new Error(result.error.message)
    }

    alert(isEdit.value ? 'แก้ไขสินค้าสำเร็จ!' : 'เพิ่มสินค้าสำเร็จ!')
    emit('save')
  } catch (error) {
    console.error('Error saving product:', error)
    alert('เกิดข้อผิดพลาด: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1.25rem;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.image-upload-container {
  margin-top: 0.5rem;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 0.5rem;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-remove-image:hover {
  background: rgba(0, 0, 0, 0.8);
}

.upload-placeholder {
  position: relative;
  width: 100%;
  height: 200px;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-placeholder:hover {
  border-color: #3b82f6;
  background: #f9fafb;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.upload-content {
  text-align: center;
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
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

.btn-primary {
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-body {
    padding: 1rem;
  }
}
</style>