import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrency } from '@/hooks/useCurrency';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  price_usd?: number;
  image_url: string;
  category: string;
  rating: number;
  review_count: number;
}

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
}

const ProductCard = ({ product, onProductClick }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await addToCart(product.id);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/auth');
      return;
    }
    await addToCart(product.id);
    navigate('/cart');
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className="h-full cursor-pointer gold-border overflow-hidden hover:gold-glow transition-all"
        onClick={() => onProductClick(product)}
      >
        <CardContent className="p-0">
          <div className="aspect-square overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-display text-lg font-semibold line-clamp-1">
              {product.name}
            </h3>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating)
                      ? 'fill-accent text-accent'
                      : 'text-muted'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({product.review_count})
              </span>
            </div>
            <p className="text-2xl font-display font-bold text-gold-gradient">
              {formatPrice((product as any).price_usd ?? product.price)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;
