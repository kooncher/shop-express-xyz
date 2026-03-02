import { describe, it, expect, beforeEach } from 'vitest'

describe('My Orders Page Logic', () => {
  let mockOrders;

  beforeEach(() => {
    // จำลองข้อมูลออเดอร์หลากหลายสถานะ
    mockOrders = [
      { id: 1, order_number: 'ORD001', status: 'pending', payment_status: 'unpaid' },
      { id: 2, order_number: 'ORD002', status: 'shipping', payment_status: 'paid' },
      { id: 3, order_number: 'ORD003', status: 'completed', payment_status: 'paid' },
      { id: 4, order_number: 'ORD004', status: 'cancelled', payment_status: 'unpaid' },
    ];
  });

  // --- 1. ทดสอบการนับจำนวนตามสถานะ (Stats) ---
  it('ควรนับจำนวนออเดอร์ตามสถานะที่กำหนดได้ถูกต้อง', () => {
    const getOrdersByStatus = (status) => {
      return mockOrders.filter(order => order.status === status);
    };

    expect(getOrdersByStatus('pending').length).toBe(1);
    expect(getOrdersByStatus('shipping').length).toBe(1);
    expect(getOrdersByStatus('completed').length).toBe(1);
  });

  // --- 2. ทดสอบเงื่อนไขการแสดงปุ่ม "ชำระเงิน" ---
  it('ปุ่มชำระเงินควรแสดงเฉพาะเมื่อออเดอร์ยังไม่ชำระและไม่ถูกยกเลิก', () => {
    const canPay = (order) => {
      return order.payment_status === 'unpaid' && order.status !== 'cancelled';
    };

    expect(canPay(mockOrders[0])).toBe(true);  // ORD001: pending/unpaid -> จ่ายได้
    expect(canPay(mockOrders[1])).toBe(false); // ORD002: paid -> จ่ายไม่ได้
    expect(canPay(mockOrders[3])).toBe(false); // ORD004: cancelled -> จ่ายไม่ได้
  });

  // --- 3. ทดสอบเงื่อนไขการแสดงปุ่ม "ยกเลิก" ---
  it('ปุ่มยกเลิกควรแสดงเฉพาะเมื่อออเดอร์ยังรอดำเนินการและยังไม่ชำระเงิน', () => {
    const canCancel = (order) => {
      return order.status === 'pending' && order.payment_status === 'unpaid';
    };

    expect(canCancel(mockOrders[0])).toBe(true);  // ORD001: pending/unpaid -> ยกเลิกได้
    expect(canCancel(mockOrders[1])).toBe(false); // ORD002: shipping/paid -> ยกเลิกไม่ได้
  });

  // --- 4. ทดสอบฟังก์ชัน Format ตัวเลข (Ensure Quality) ---
  it('ควร Format ตัวเลขราคาให้มีทศนิยม 2 ตำแหน่งเสมอ', () => {
    const formatNumber = (num) => {
      return new Intl.NumberFormat("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    };

    expect(formatNumber(100)).toBe('100.00');
    expect(formatNumber(1250.5)).toBe('1,250.50');
  });
});