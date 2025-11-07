import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const coupons = [
  { code: '茉莉安', discount: '20% OFF', description: 'on all items' },
  { code: 'HEATHER25', discount: '20% OFF', description: 'on ordered items' },
  { code: 'ROYAL10', discount: '10% OFF', description: 'on your next purchase' },
  { code: 'GOLD15', discount: '15% OFF', description: 'on orders over $200' },
  { code: 'FREESHIP', discount: 'Free Shipping', description: 'on all orders' },
  { code: 'LUXURY20', discount: '20% OFF', description: 'on premium items' },
];

const CouponPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(coupons[0]);

  useEffect(() => {
    const showPopup = () => {
      const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];
      setCurrentCoupon(randomCoupon);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 10000); // auto-hide after 10s
    };

    const initialTimer = setTimeout(showPopup, 10000); // show after 10s
    const interval = setInterval(showPopup, 5 * 60 * 1000); // every 5 min

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCoupon.code);
    toast.success('Coupon code copied!');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsVisible(false)} // click background to close
        >
          {/* Card Container - Stops Clicks from Reaching Background */}
          <motion.div
            onClick={(e) => e.stopPropagation()} // ⛔ stop overlay clicks
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <Card className="gold-border gold-glow w-80 relative overflow-hidden bg-gradient-to-b from-[#1a0f0f] to-[#2d1a1a] text-center shadow-xl rounded-2xl">
              {/* Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-3 right-3 text-gold hover:text-gold/70 transition-colors z-50"
                aria-label="Close popup"
              >
                <X className="h-5 w-5" />
              </button>

              <CardContent className="p-6 relative">
                {/* Header */}
                <div className="flex flex-col items-center mb-4 mt-2">
                  <Gift className="h-6 w-6 text-gold mb-2" />
                  <h3 className="font-display font-bold text-lg text-gold">SPECIAL OFFER!</h3>
                  <p className="text-sm text-muted-foreground">Limited time only</p>
                </div>

                {/* Discount */}
                <div className="text-center mb-4">
                  <p className="text-3xl font-display font-bold text-gold mb-1">
                    {currentCoupon.discount}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentCoupon.description}
                  </p>
                </div>

                {/* Code */}
                <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-center border border-gold/20">
                  <p className="text-sm text-muted-foreground mb-1">Use code:</p>
                  <p className="text-xl font-display font-bold text-accent">
                    {currentCoupon.code}
                  </p>
                </div>

                {/* Copy Button */}
                <Button
                  className="w-full bg-gold text-primary font-semibold hover:bg-gold/90 transition-all"
                  onClick={handleCopy}
                >
                  Copy Code
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CouponPopup;
