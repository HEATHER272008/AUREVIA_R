import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const checkoutSchema = z.object({
  recipient_name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  contact_info: z.string().trim().min(1, 'Contact information is required').max(100, 'Contact must be less than 100 characters'),
  delivery_address: z.string().trim().min(1, 'Address is required').max(500, 'Address must be less than 500 characters'),
  payment_method: z.string().min(1, 'Please select a payment method'),
  message: z.string().trim().max(500, 'Message must be less than 500 characters').optional(),
});

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
}

const Checkout = () => {
  const { user } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState({
    recipient_name: '',
    contact_info: '',
    delivery_address: '',
    payment_method: '',
    message: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Get checkout items from session storage
    const items = sessionStorage.getItem('checkoutItems');
    if (!items) {
      toast.error('No items selected for checkout');
      navigate('/cart');
      return;
    }

    try {
      const parsedItems = JSON.parse(items);
      setCheckoutItems(parsedItems);
    } catch (error) {
      toast.error('Invalid checkout data');
      navigate('/cart');
    }
  }, [user, navigate]);

  const totalAmount = checkoutItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form data
    try {
      checkoutSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending',
          recipient_name: formData.recipient_name.trim(),
          contact_info: formData.contact_info.trim(),
          delivery_address: formData.delivery_address.trim(),
          payment_method: formData.payment_method,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = checkoutItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Remove items from cart
      for (const item of checkoutItems) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', item.id);
      }

      // Clear session storage
      sessionStorage.removeItem('checkoutItems');

      // Show success message
      toast.success('Order placed successfully!', {
        description: `Your order #${order.id.slice(0, 8)} has been placed. We'll contact you soon!`,
        duration: 5000,
      });

      // Navigate to shop
      setTimeout(() => {
        navigate('/shop');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <h1 className="text-3xl font-display mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Recipient Name */}
                  <div className="space-y-2">
                    <Label htmlFor="recipient_name">Recipient Name *</Label>
                    <Input
                      id="recipient_name"
                      placeholder="Enter recipient name"
                      value={formData.recipient_name}
                      onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Contact Number *</Label>
                    <Input
                      id="contact_info"
                      type="tel"
                      placeholder="Enter contact number"
                      value={formData.contact_info}
                      onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                      maxLength={100}
                      required
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-2">
                    <Label htmlFor="delivery_address">Delivery Address *</Label>
                    <Textarea
                      id="delivery_address"
                      placeholder="Enter complete delivery address"
                      value={formData.delivery_address}
                      onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                      maxLength={500}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Payment Method *</Label>
                    <RadioGroup
                      value={formData.payment_method}
                      onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                      required
                    >
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          Cash on Delivery
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="gcash" id="gcash" />
                        <Label htmlFor="gcash" className="flex-1 cursor-pointer">
                          GCash
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                        <RadioGroupItem value="bank" id="bank" />
                        <Label htmlFor="bank" className="flex-1 cursor-pointer">
                          Bank Transfer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Any special instructions or requests?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={500}
                      rows={3}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      `Place Order - $${totalAmount.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded gold-border"
                    />
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1 text-sm">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-accent">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping:</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-lg font-display font-bold">Total:</span>
                    <span className="text-2xl font-display font-bold text-accent">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
