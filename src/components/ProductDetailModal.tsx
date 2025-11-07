import { Star, ShoppingCart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
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

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  if (!product) return null;

  const handleAddToCart = async () => {
    await addToCart(product.id);
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/auth');
      onClose();
      return;
    }
    await addToCart(product.id);
    navigate('/cart');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aspect-square gold-border rounded-lg overflow-hidden"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? 'fill-accent text-accent'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">
                {product.rating.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <p className="text-4xl font-display font-bold text-gold-gradient mb-6">
              {formatPrice((product as any).price_usd ?? product.price)}
            </p>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-display text-lg font-semibold mb-2">
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-auto">
              <Button
                variant="outline"
                className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal;
