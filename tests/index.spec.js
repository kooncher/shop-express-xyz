import { describe, it, expect, beforeEach } from 'vitest'
import { reactive, computed } from 'vue'

//จำลอง Logic จากหน้า index.vue ของคุณ
describe('Shop Page Logic', () => {
  let cart;
  let products;

  beforeEach(() => {
    // เตรียมข้อมูลจำลองก่อนทุกครั้งที่เริ่ม Test case ใหม่
    cart = reactive([]);
    products = [
      { id: 1, name: 'เสื้อยืด', price: 100, category: 'เสื้อผ้า' },
      { id: 2, name: 'กางเกง', price: 200, category: 'เสื้อผ้า' }
    ];
  });

  // 1. ทดสอบการเพิ่มสินค้าลงตะกร้า (addToCart)
  it('ควรเพิ่มสินค้าใหม่ลงตะกร้าได้ถูกต้อง', () => {
    const product = products[0];
    
    // Logic addToCart ที่ก๊อปมาจากโค้ดคุณ
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    expect(cart.length).toBe(1);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].name).toBe('เสื้อยืด');
  });

  it('ถ้าเพิ่มสินค้าซ้ำ จำนวน (quantity) ต้องเพิ่มขึ้น ไม่ใช่เพิ่มแถวใหม่', () => {
    const product = products[0];
    
    // เพิ่มครั้งที่ 1
    cart.push({ ...product, quantity: 1 });
    // เพิ่มครั้งที่ 2 (จำลอง Logic เดิม)
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) existingItem.quantity++;

    expect(cart.length).toBe(1); // แถวต้องเท่าเดิม
    expect(cart[0].quantity).toBe(2); // แต่จำนวนต้องเป็น 2
  });

  // 2. ทดสอบการคำนวณราคารวม (cartTotal)
  it('ควรคำนวณราคารวมในตะกร้าได้ถูกต้อง', () => {
    cart.push({ id: 1, price: 100, quantity: 2 }); // 200
    cart.push({ id: 2, price: 200, quantity: 1 }); // 200
    
    const cartTotal = computed(() => {
      return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    });

    expect(cartTotal.value).toBe(400);
  });
});
// 3. ทดสอบระบบค้นหาและกรองสินค้า (FilteredProducts)
  describe('ระบบการกรองสินค้า (Search & Filter)', () => {
    const allProducts = [
      { id: 1, name: 'เสื้อยืดสีขาว', category: 'เสื้อผ้า' },
      { id: 2, name: 'กางเกงยีนส์', category: 'เสื้อผ้า' },
      { id: 3, name: 'มาม่ารสเผ็ด', category: 'อาหารและเครื่องดื่ม' },
      { id: 4, name: 'JavaScript Book', category: 'หนังสือ' }
    ];

    it('ควรกรองสินค้าตาม "ชื่อ" ที่พิมพ์ค้นหาได้ (Search Query)', () => {
      const searchQuery = 'เสื้อ';
      
      // Logic การกรองที่ก๊อปมาจาก computed ในไฟล์ index.vue ของคุณ
      const filtered = allProducts.filter((product) => {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('เสื้อยืดสีขาว');
    });

    it('ควรกรองสินค้าตาม "หมวดหมู่" ที่เลือกได้ (Category Filter)', () => {
      const selectedCategory = 'อาหารและเครื่องดื่ม';
      
      const filtered = allProducts.filter((product) => {
        return selectedCategory === "ทั้งหมด" || product.category === selectedCategory;
      });

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('มาม่ารสเผ็ด');
    });

    it('ถ้าเลือกหมวด "ทั้งหมด" ต้องแสดงสินค้าครบทุกตัว', () => {
      const selectedCategory = 'ทั้งหมด';
      
      const filtered = allProducts.filter((product) => {
        return selectedCategory === "ทั้งหมด" || product.category === selectedCategory;
      });

      expect(filtered.length).toBe(4);
    });

    it('ถ้าค้นหาคำที่ไม่มีอยู่จริง ต้องไม่แสดงสินค้าใดๆ', () => {
      const searchQuery = 'เครื่องซักผ้า';
      
      const filtered = allProducts.filter((product) => {
        return product.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      expect(filtered.length).toBe(0);
    });
  });