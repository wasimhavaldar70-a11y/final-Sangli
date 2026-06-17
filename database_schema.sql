-- ====================================================================
-- SANGLI CERAMICA DATABASE MIGRATIONS & SCHEMA SETUP
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. CLEANUP (FOR RE-RUNNABILITY)
-- --------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.settings cascade;
drop table if exists public.blogs cascade;
drop table if exists public.projects cascade;
drop table if exists public.gallery cascade;
drop table if exists public.testimonials cascade;
drop table if exists public.appointments cascade;
drop table if exists public.inquiries cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.users cascade;

-- --------------------------------------------------------------------
-- 2. CREATE TABLES
-- --------------------------------------------------------------------

-- Profile / User Table linked to Supabase Auth
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories Table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  image_url text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Products Table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10, 2),
  brand text,
  size text,
  finish text,
  material text,
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  featured boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Product Multiple Images Table
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  image_url text not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customer Inquiries (from Contact Form or Product details)
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  product_id uuid references public.products(id) on delete set null,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Showroom Visit Appointments
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  appointment_date timestamp with time zone not null,
  message text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customer Testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text,
  review text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Showroom/Inspiration Gallery
create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  category text not null, -- e.g., 'Bathroom', 'Living Room', 'Kitchen', 'Outdoor'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Portfolio Projects Showcase
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blogs / Articles Management
create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null,
  featured_image text,
  published boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Global Website Settings
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  website_name text not null default 'Sangli Ceramica',
  logo text,
  address text,
  phone text,
  email text,
  whatsapp text,
  google_map text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 3. INDEXES FOR PERFORMANCE
-- --------------------------------------------------------------------
create index idx_products_slug on public.products(slug);
create index idx_products_category_id on public.products(category_id);
create index idx_categories_slug on public.categories(slug);
create index idx_blogs_slug on public.blogs(slug);
create index idx_inquiries_status on public.inquiries(status);
create index idx_appointments_status on public.appointments(status);
create index idx_product_images_product_id on public.product_images(product_id);

-- --------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.inquiries enable row level security;
alter table public.appointments enable row level security;
alter table public.testimonials enable row level security;
alter table public.gallery enable row level security;
alter table public.projects enable row level security;
alter table public.blogs enable row level security;
alter table public.settings enable row level security;

-- Setup RLS Policies

-- Public Read / Admin All Helper Function
create or replace function public.is_admin()
returns boolean as $$
begin
  -- Check if user is logged in and is marked as admin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- USERS Table
create policy "Admins can view and edit all users"
  on public.users for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Users can view their own profile"
  on public.users for select to authenticated
  using (id = auth.uid());

create policy "Users can update their own profile details"
  on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- CATEGORIES Table
create policy "Allow public select on categories"
  on public.categories for select to public using (true);

create policy "Allow admin write on categories"
  on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- PRODUCTS Table
create policy "Allow public select on products"
  on public.products for select to public using (true);

create policy "Allow admin write on products"
  on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- PRODUCT IMAGES Table
create policy "Allow public select on product images"
  on public.product_images for select to public using (true);

create policy "Allow admin write on product images"
  on public.product_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- INQUIRIES Table
create policy "Allow public inserts on inquiries"
  on public.inquiries for insert to public with check (true);

create policy "Allow admin view and write on inquiries"
  on public.inquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- APPOINTMENTS Table
create policy "Allow public inserts on appointments"
  on public.appointments for insert to public with check (true);

create policy "Allow admin view and write on appointments"
  on public.appointments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- TESTIMONIALS Table
create policy "Allow public select on testimonials"
  on public.testimonials for select to public using (true);

create policy "Allow admin write on testimonials"
  on public.testimonials for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- GALLERY Table
create policy "Allow public select on gallery"
  on public.gallery for select to public using (true);

create policy "Allow admin write on gallery"
  on public.gallery for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- PROJECTS Table
create policy "Allow public select on projects"
  on public.projects for select to public using (true);

create policy "Allow admin write on projects"
  on public.projects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- BLOGS Table
create policy "Allow public select on published blogs"
  on public.blogs for select to public using (published = true or public.is_admin());

create policy "Allow admin write on blogs"
  on public.blogs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- SETTINGS Table
create policy "Allow public select on settings"
  on public.settings for select to public using (true);

create policy "Allow admin write on settings"
  on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());


-- --------------------------------------------------------------------
-- 5. TRIGGER ON NEW AUTH USER
-- --------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  is_first_user boolean;
begin
  -- Check if this is the first user registered on the platform
  select count(*) = 0 into is_first_user from public.users;

  insert into public.users (id, name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''),
    case when is_first_user then 'admin' else 'customer' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- --------------------------------------------------------------------
-- 6. SEED DATA
-- --------------------------------------------------------------------

-- Insert Settings
insert into public.settings (website_name, logo, address, phone, email, whatsapp, google_map)
values (
  'Sangli Ceramica',
  '/images/logo.png',
  '123, Luxury Showroom Lane, Near Sangli bypass, Sangli, Maharashtra 416416, India',
  '+91 98765 43210',
  'info@sangliceramica.com',
  '+91 98765 43210',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3818.5721111623826!2d74.58284561486835!3d16.847528388405086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc1230000000001%3A0x8e83b8b1a8d052b6!2sSangli%20Ceramica!5e0!3m2!1sen!2sin!4v1624000000000!5m2!1sen!2sin'
);

-- Insert Categories
insert into public.categories (id, name, slug, image_url, description)
values
  ('c1111111-1111-1111-1111-111111111111', 'Floor Tiles', 'floor-tiles', '/images/categories/floor-tiles.jpg', 'Premium vitrified and glazed floor tiles for home and office spaces.'),
  ('c2222222-2222-2222-2222-222222222222', 'Wall Tiles', 'wall-tiles', '/images/categories/wall-tiles.jpg', 'Designer wall tiles in matte, glossy, and textured finishes for kitchens and bathrooms.'),
  ('c3333333-3333-3333-3333-333333333333', 'Sanitary Ware', 'sanitary-ware', '/images/categories/sanitary-ware.jpg', 'Elegant water closets, washbasins, and cabinets for modern bathrooms.'),
  ('c4444444-4444-4444-4444-444444444444', 'Bath Fittings & Faucets', 'bath-fittings-faucets', '/images/categories/bath-fittings.jpg', 'Luxury faucets, shower systems, and bathroom accessories.');

-- Insert Products
insert into public.products (id, category_id, name, slug, description, price, brand, size, finish, material, stock_status, featured)
values
  -- Floor Tiles
  ('p1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Royal Statuario Vitrified', 'royal-statuario-vitrified', 'Premium Statuario Italian marble-look glazed vitrified floor tiles with high gloss finish.', 125.00, 'Kajaria', '800x1600 mm', 'High Gloss', 'Vitrified', 'in_stock', true),
  ('p1111111-1111-1111-1111-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Obsidian Black Matt', 'obsidian-black-matt', 'Deep charcoal black double charge vitrified tiles, anti-skid and heavy duty.', 95.00, 'Somany', '600x1200 mm', 'Matte', 'Double Charge Vitrified', 'in_stock', false),
  ('p1111111-1111-1111-1111-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Rustic Oak Wood Planks', 'rustic-oak-wood-planks', 'Natural wooden plank feel porcelain tiles with high-definition wood grain texture.', 110.00, 'Nerolac Ceramica', '200x1200 mm', 'Matte / Textured', 'Porcelain', 'in_stock', true),

  -- Wall Tiles
  ('p2222222-2222-2222-2222-111111111111', 'c2222222-2222-2222-2222-222222222222', 'Carrara Gold Highlighter', 'carrara-gold-highlighter', 'Luxury ceramic wall tiles featuring elegant gold veins. Ideal for kitchen splashbacks and bathroom highlighters.', 85.00, 'Kajaria', '300x600 mm', 'Glossy', 'Ceramic', 'in_stock', true),
  ('p2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Neo Mint Hexagon', 'neo-mint-hexagon', 'Premium hexagon mosaic wall tiles for a modern visual style.', 150.00, 'Decora', '300x300 mm', 'Satin Matt', 'Ceramic', 'in_stock', false),

  -- Sanitary Ware
  ('p3333333-3333-3333-3333-111111111111', 'c3333333-3333-3333-3333-222222222222', 'Velvet One-Piece Water Closet', 'velvet-one-piece-water-closet', 'Luxury rimless one-piece toilet with soft close seat and dual tornado flush mechanism.', 14500.00, 'Jaquar', 'Standard', 'Premium Glaze White', 'Ceramic', 'in_stock', true),
  ('p3333333-3333-3333-3333-222222222222', 'c3333333-3333-3333-3333-222222222222', 'Aura Table Top Basin', 'aura-table-top-basin', 'Artistic thin rim circular ceramic table top wash basin in matte white finish.', 4200.00, 'Hindware', '400x400 mm', 'Matte White', 'Ceramic', 'in_stock', true),

  -- Bath Fittings & Faucets
  ('p4444444-4444-4444-4444-111111111111', 'c4444444-4444-4444-4444-222222222222', 'Rose Gold Basin Mixer', 'rose-gold-basin-mixer', 'Tallboy single-lever bathroom basin mixer in premium PVD rose gold coating.', 6500.00, 'Jaquar', 'Tallboy', 'PVD Rose Gold', 'Brass', 'in_stock', true),
  ('p4444444-4444-4444-4444-222222222222', 'c4444444-4444-4444-4444-222222222222', 'Thermostatic Multi-Flow Shower Panel', 'thermostatic-shower-panel', 'Smart thermostatic body shower panel with overhead rain shower, hand shower, and 4 body jets.', 24500.00, 'Grohe', 'Full Panel', 'Brushed Chrome', 'Stainless Steel', 'in_stock', true);

-- Insert Product Images
insert into public.product_images (product_id, image_url, sort_order)
values
  ('p1111111-1111-1111-1111-111111111111', '/images/products/royal-statuario-1.jpg', 1),
  ('p1111111-1111-1111-1111-111111111111', '/images/products/royal-statuario-2.jpg', 2),
  ('p1111111-1111-1111-1111-222222222222', '/images/products/obsidian-black-1.jpg', 1),
  ('p1111111-1111-1111-1111-333333333333', '/images/products/rustic-oak-1.jpg', 1),
  ('p2222222-2222-2222-2222-111111111111', '/images/products/carrara-gold-1.jpg', 1),
  ('p3333333-3333-3333-3333-111111111111', '/images/products/velvet-wc-1.jpg', 1),
  ('p3333333-3333-3333-3333-222222222222', '/images/products/aura-basin-1.jpg', 1),
  ('p4444444-4444-4444-4444-111111111111', '/images/products/rose-gold-mixer-1.jpg', 1),
  ('p4444444-4444-4444-4444-222222222222', '/images/products/shower-panel-1.jpg', 1);

-- Insert Testimonials
insert into public.testimonials (name, designation, review, rating, image_url)
values
  ('Amit Deshmukh', 'Architect & Interior Designer', 'Sangli Ceramica has an outstanding range of tiles. Their Statuario collection was the perfect choice for my client''s luxury villa in Sangli. Highly professional staff!', 5, '/images/testimonials/amit.jpg'),
  ('Priya Shah', 'Home Owner', 'We got our entire bathroom fittings and tiles from here. The thermostatic shower and rose gold mixers look premium and work flawlessly. Excellent guidance by their team!', 5, '/images/testimonials/priya.jpg'),
  ('Rahul Patil', 'Builder, Patil Constructions', 'Reliable pricing, genuine brands, and consistent supply. For all our projects in Western Maharashtra, Sangli Ceramica is our go-to showroom.', 5, '/images/testimonials/rahul.jpg');

-- Insert Gallery Images
insert into public.gallery (title, image_url, category)
values
  ('Luxury Living Room with Statuario Tiles', '/images/gallery/living-room-1.jpg', 'Living Room'),
  ('Modern Master Bathroom with Rose Gold Accents', '/images/gallery/bathroom-1.jpg', 'Bathroom'),
  ('Minimalist Kitchen Splashback Design', '/images/gallery/kitchen-1.jpg', 'Kitchen'),
  ('Outdoor Deck with Wood Planks', '/images/gallery/outdoor-1.jpg', 'Outdoor');

-- Insert Projects
insert into public.projects (title, description, location, image_url)
values
  ('The Royal Villa', 'Full flooring and bathroom fittings for a 5BHK luxury bungalow using Italian marble tiles and premium Jaquar fittings.', 'Sangli Road, Miraj', '/images/projects/project1.jpg'),
  ('Emerald Corporate Tower', 'Commercial double charge vitrified flooring and premium sanitary wares across 6 floors.', 'Vishrambag, Sangli', '/images/projects/project2.jpg'),
  ('Skyline Penthouse', 'Custom porcelain planks deck and open-terrace tiles installation with rustic finishing.', 'Kupwad, Sangli', '/images/projects/project3.jpg');

-- Insert Blogs
insert into public.blogs (title, slug, content, featured_image, published)
values
  ('How to Choose the Perfect Floor Tile for Your Living Room', 'how-to-choose-floor-tile-living-room', 'Choosing the right flooring is a crucial decision when designing your home. Read this comprehensive guide about vitrified tiles, glossy finishes, and matte anti-skid options...', '/images/blogs/blog1.jpg', true),
  ('5 Trending Bathroom Designs in 2026', '5-trending-bathroom-designs-2026', 'From PVD gold finishes to rimless water closets and natural stone tiles, discover what design elements are transforming bathrooms this year...', '/images/blogs/blog2.jpg', true);
