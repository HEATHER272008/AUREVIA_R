import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
}

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setFeaturedProducts(data || []);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              className="flex justify-center mb-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Crown className="h-16 w-16 md:h-20 md:w-20 text-accent" strokeWidth={1.5} />
            </motion.div>
            <motion.h1
              className="text-5xl md:text-7xl font-display font-bold mb-6 text-gold-gradient"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Elegance Worthy of Royalty
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-8 text-primary-foreground/90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              At Aurevia, we believe that accessories are more than just finishing touches—they’re reflections of who you are.
              Discover our exclusive collection of handcrafted luxury accessories, designed for those who appreciate timeless beauty.

            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link to="/shop">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground hover:bg-accent/90 gold-glow text-lg px-8"
                >
                  Shop Now
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-lg px-8"
                >
                  Our Story
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Crown,
                title: 'Royal Quality',
                description: 'Every piece is crafted with the finest materials',
              },
              {
                icon: Sparkles,
                title: 'Timeless Elegance',
                description: 'Designs that transcend trends and seasons',
              },
              {
                icon: Award,
                title: 'Exquisite Craftsmanship',
                description: 'Handmade by master artisans with decades of experience',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center p-6 rounded-lg gold-border hover:gold-glow transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 text-accent mb-4">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground text-lg">
              ✨ Style for Everyone — Accessories Beyond Gender
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onProductClick={handleProductClick}
                />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/shop">
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Home;
