
-- Migration: 20251104155701

-- Migration: 20251104153550

-- Migration: 20251104142301

-- Migration: 20251104134246

-- Migration: 20251104132552
-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products (public shop)
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert into their own cart
CREATE POLICY "Users can insert own cart"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete from their own cart
CREATE POLICY "Users can delete own cart"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  coupon_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own order items
CREATE POLICY "Users can view own order_items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items for their orders
CREATE POLICY "Users can create own order_items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, category, rating, review_count) VALUES
  ('Royal Crown Necklace', 'Exquisite gold-plated necklace with crown pendant, adorned with precious stones', 299.99, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', 'Necklaces', 5.0, 124),
  ('Diamond Elegance Earrings', 'Stunning diamond-cut earrings that catch the light beautifully', 189.99, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', 'Earrings', 4.8, 89),
  ('Golden Rose Bracelet', 'Delicate bracelet featuring rose gold finish with floral motifs', 149.99, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 'Bracelets', 4.9, 156),
  ('Sapphire Pendant', 'Classic pendant with deep blue sapphire centerpiece', 259.99, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', 'Pendants', 5.0, 201),
  ('Pearl Drop Earrings', 'Timeless pearl earrings with elegant drop design', 129.99, 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=500', 'Earrings', 4.7, 67),
  ('Infinity Love Ring', 'Symbolic infinity ring crafted in pure gold', 199.99, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 'Rings', 4.9, 143),
  ('Vintage Brooch', 'Antique-style brooch with intricate filigree work', 89.99, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 'Brooches', 4.6, 45),
  ('Emerald Statement Ring', 'Bold statement ring featuring vibrant emerald stone', 349.99, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 'Rings', 5.0, 178),
  ('Crystal Tiara', 'Regal tiara adorned with sparkling crystals', 449.99, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500', 'Tiaras', 5.0, 92),
  ('Gold Chain Anklet', 'Delicate gold chain anklet with charm accents', 79.99, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500', 'Anklets', 4.5, 34),
  ('Ruby Heart Pendant', 'Romantic heart-shaped pendant with ruby gemstone', 279.99, 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500', 'Pendants', 4.8, 112),
  ('Platinum Wedding Band', 'Classic platinum wedding band with polished finish', 399.99, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500', 'Rings', 5.0, 267);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- Migration: 20251104140238
-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  rating NUMERIC DEFAULT 5,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products
CREATE POLICY "Products are viewable by everyone"
  ON public.products
  FOR SELECT
  USING (true);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own cart items
CREATE POLICY "Users can view their own cart items"
  ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items"
  ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items"
  ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items"
  ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);



-- Migration: 20251104153755
-- Drop duplicate policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
DROP POLICY IF EXISTS "Users can view own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can insert own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can update own cart" ON public.cart_items;
DROP POLICY IF EXISTS "Users can delete own cart" ON public.cart_items;

-- Ensure we only have the correct policies
DO $$ 
BEGIN
  -- For products table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' 
    AND policyname = 'Products are viewable by everyone'
  ) THEN
    CREATE POLICY "Products are viewable by everyone" 
    ON public.products 
    FOR SELECT 
    USING (true);
  END IF;
  
  -- For cart_items table
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can view their own cart items'
  ) THEN
    CREATE POLICY "Users can view their own cart items" 
    ON public.cart_items 
    FOR SELECT 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can insert their own cart items'
  ) THEN
    CREATE POLICY "Users can insert their own cart items" 
    ON public.cart_items 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can update their own cart items'
  ) THEN
    CREATE POLICY "Users can update their own cart items" 
    ON public.cart_items 
    FOR UPDATE 
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'cart_items' 
    AND policyname = 'Users can delete their own cart items'
  ) THEN
    CREATE POLICY "Users can delete their own cart items" 
    ON public.cart_items 
    FOR DELETE 
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Migration: 20251104154353
-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS contact_number TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);


-- Migration: 20251104160214
-- Fix security issues by adding missing RLS policies

-- 1. Add INSERT policy for profiles table (CRITICAL)
-- Only allow users to create their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- 2. Add DELETE policy for profiles table
-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- 3. Add INSERT policy for orders table
-- Ensure users can only create orders for themselves
CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Add UPDATE policy for orders table
-- Allow users to update their own pending orders
CREATE POLICY "Users can update their own pending orders"
ON public.orders
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- 5. Add DELETE policy for orders table
-- Allow users to cancel their own pending orders
CREATE POLICY "Users can cancel their own pending orders"
ON public.orders
FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');
