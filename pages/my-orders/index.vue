<template>
  <div class="orders-container">
     <button class="floating-hamburger-btn" @click="toggleMobileSidebar">
      <div class="hamburger-icon-wrapper">
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
        <span :class="{ 'line-open': showMobileSidebar }"></span>
      </div>
    </button>

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

    <h1>รายการคำสั่งซื้อของฉัน</h1>
    
    <div v-for="order in orders" :key="order.id" class="order-card">
      <div class="order-header">
        <span class="order-id">#{{ order.order_number }}</span>
        <span :class="['status-badge', order.status]">{{ formatStatus(order.status) }}</span>
      </div>
      
      <div class="order-summary">
        ยอดรวม: ฿{{ order.total_amount }}
      </div>

      <div class="order-actions">
        <button v-if="order.status === 'pending'" @click="openPaymentModal(order)" class="btn-pay">
          ชำระเงิน / แจ้งโอน
        </button>
        <button @click="viewDetail(order.id)" class="btn-detail">ดูรายละเอียด</button>
      </div>
    </div>
  </div>
</template>