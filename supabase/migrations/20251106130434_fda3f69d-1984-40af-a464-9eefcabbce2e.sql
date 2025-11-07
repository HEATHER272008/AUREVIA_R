-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add country and currency to profiles
ALTER TABLE public.profiles
ADD COLUMN country TEXT DEFAULT 'US',
ADD COLUMN currency_preference TEXT DEFAULT 'USD';

-- Add seller_id to products table
ALTER TABLE public.products
ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN price_usd NUMERIC NOT NULL DEFAULT 0;

-- Update existing products to use price_usd
UPDATE public.products SET price_usd = price;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Users can update their own product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update products table RLS policies for sellers
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;

CREATE POLICY "Products are viewable by everyone"
ON public.products
FOR SELECT
USING (true);

CREATE POLICY "Sellers and admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'seller') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Sellers can update their own products"
ON public.products
FOR UPDATE
TO authenticated
USING (
  seller_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Sellers can delete their own products"
ON public.products
FOR DELETE
TO authenticated
USING (
  seller_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);