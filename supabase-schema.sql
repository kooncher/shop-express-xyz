-- =====================================================
-- E-COMMERCE DATABASE SCHEMA FOR SUPABASE
-- =====================================================
-- คัดลอกไปรันใน Supabase SQL Editor
-- =====================================================

-- 1. สร้างตาราง users (ใช้ auth.users ของ Supabase)
-- แต่เพิ่มตาราง profiles สำหรับข้อมูลเพิ่มเติม

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer', -- 'customer' หรือ 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. สร้างตาราง categories (หมวดหมู่สินค้า)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. สร้างตาราง products (สินค้า)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  images JSONB, -- เก็บรูปหลายรูป
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. สร้างตาราง orders (คำสั่งซื้อ)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. สร้างตาราง order_items (รายการสินค้าในคำสั่งซื้อ)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL, -- เก็บชื่อไว้ในกรณีที่สินค้าถูกลบ
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL, -- ราคาขณะสั่งซื้อ
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. สร้างตาราง cart (ตะกร้าสินค้า)
CREATE TABLE IF NOT EXISTS public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- =====================================================
-- INDEXES สำหรับเพิ่มประสิทธิภาพ
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user ON public.cart(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories policies (ทุกคนอ่านได้, แค่ admin แก้ไขได้)
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies (ทุกคนอ่านได้, แค่ admin แก้ไขได้)
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Only admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders policies (เห็นแค่ของตัวเอง หรือเป็น admin)
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Cart policies (เห็นและจัดการแค่ของตัวเอง)
CREATE POLICY "Users can manage own cart" ON public.cart
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: อัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers สำหรับ updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON public.cart
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: สร้าง profile อัตโนมัติเมื่อ user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: สร้าง profile เมื่อมี user ใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAMPLE DATA (ข้อมูลตัวอย่าง)
-- =====================================================

-- Insert categories
INSERT INTO public.categories (name, description, image_url) VALUES
  ('อิเล็กทรอนิกส์', 'สินค้าอิเล็กทรอนิกส์และแกดเจ็ต', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03'),
  ('เสื้อผ้า', 'เสื้อผ้าแฟชั่นทุกสไตล์', 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f'),
  ('อาหารและเครื่องดื่ม', 'อาหารและเครื่องดื่มคุณภาพ', 'https://images.unsplash.com/photo-1496412705862-e0088f16f791'),
  ('ของใช้ในบ้าน', 'ของใช้ในบ้านและของตแต่งบ้าน', 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6'),
  ('กีฬาและกิจกรรมกลางแจ้ง', 'อุปกรณ์กีฬาและกิจกรรมกลางแจ้ง', 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO public.products (category_id, name, description, price, stock, image_url) 
SELECT 
  c.id,
  'Wireless Headphones',
  'หูฟังไร้สายคุณภาพสูง เสียงใส ใส่สบาย',
  2990.00,
  50,
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'
FROM public.categories c WHERE c.name = 'อิเล็กทรอนิกส์' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (category_id, name, description, price, stock, image_url)
SELECT 
  c.id,
  'Smart Watch',
  'นาฬิกาอัจฉริยะ ติดตามสุขภาพและการออกกำลังกาย',
  5990.00,
  30,
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
FROM public.categories c WHERE c.name = 'อิเล็กทรอนิกส์' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.products (category_id, name, description, price, stock, image_url)
SELECT 
  c.id,
  'T-Shirt Premium',
  'เสื้อยืดคุณภาพดี ใส่สบาย ระบายอากาศได้ดี',
  399.00,
  100,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
FROM public.categories c WHERE c.name = 'เสื้อผ้า' LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- DONE! 🎉
-- =====================================================
-- ตอนนี้ Database พร้อมใช้งานแล้ว
-- ไปขั้นตอนต่อไป: สร้าง Nuxt Application
-- =====================================================
