-- Create users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create sizes table
CREATE TABLE IF NOT EXISTS public.sizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create colors table
CREATE TABLE IF NOT EXISTS public.colors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  hex TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  stock INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create product_variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  size_id UUID REFERENCES public.sizes(id) NOT NULL,
  color_id UUID REFERENCES public.colors(id) NOT NULL,
  stock INTEGER DEFAULT 0,
  price DECIMAL(10,2), -- Override product price if needed
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, size_id, color_id)
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('billing', 'shipping')) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'AR',
  phone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mercadopago', 'cash')) DEFAULT 'mercadopago',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  mercadopago_payment_id TEXT,
  mercadopago_preference_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  product_variant_id UUID REFERENCES public.product_variants(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cart_items table (for persistent cart)
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, product_variant_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Users can only see and manage their own addresses
CREATE POLICY "Users can view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- Users can only see and manage their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own order items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Users can only see and manage their own cart items
CREATE POLICY "Users can view own cart items" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Public read access for products, categories, sizes, colors
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view sizes" ON public.sizes FOR SELECT USING (true);
CREATE POLICY "Anyone can view colors" ON public.colors FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Anyone can view product variants" ON public.product_variants FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE products.id = product_variants.product_id AND products.active = true)
);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, first_name, last_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when auth.users record is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
