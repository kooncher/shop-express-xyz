<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="cart-modal">
      <div class="modal-header">
        <h2>ตะกร้าสินค้าของคุณ ({{ cart.length }})</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div v-if="cart.length === 0" class="empty-cart">
        <p>ไม่มีสินค้าในตะกร้า</p>
      </div>

      <div v-else class="cart-items">
        <div v-for="(item, index) in cart" :key="item.id" class="cart-item">
          <img :src="item.image || '/placeholder-product.png'" class="item-img" />
          
          <div class="item-details">
            <h4>{{ item.name }}</h4>
            <p class="price-text">฿{{ formatNumber(item.price) }}</p>
            
            <div class="quantity-controls">
              <button @click="$emit('update-qty', { index, change: -1 })" :disabled="item.quantity <= 1">-</button>
              <span>{{ item.quantity }}</span>
              <button @click="$emit('update-qty', { index, change: 1 })">+</button>
            </div>
          </div>
          
          <button class="btn-remove" @click="$emit('remove', index)">🗑️</button>
        </div>
      </div>

      <div class="modal-footer">
        <div class="total-section">
          <span>รวมทั้งสิ้น:</span>
          <span class="total-price">฿{{ formatNumber(total) }}</span>
        </div>
        <button class="btn-checkout" :disabled="cart.length === 0" @click="$emit('checkout')">
          ยืนยันการสั่งซื้อ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  cart: Array,
  total: Number
})

defineEmits(['close', 'remove', 'update-qty', 'checkout'])

const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num || 0)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  backdrop-filter: blur(4px);
}

.cart-modal {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.cart-items {
  overflow-y: auto;
  margin: 1.5rem 0;
  flex-grow: 1;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 1rem;
}

.item-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.item-details h4 {
  margin: 0;
  color: #1e293b;
}

.modal-footer {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
}

.total-section {
  display: flex;
  justify-content: space-between;
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.total-price {
  color: #4f46e5;
}

.btn-checkout {
  width: 100%;
  background: #4f46e5;
  color: white;
  padding: 1rem;
  border-radius: 1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-checkout:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}
/* เพิ่มเติมส่วน quantity-controls */
.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}
.quantity-controls button {
  width: 25px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}
</style>