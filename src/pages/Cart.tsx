import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Trash2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Auto-select all items when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    }
  }, [cartItems]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(cartItems.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to delete');
      return;
    }

    for (const itemId of selectedItems) {
      await removeFromCart(itemId);
    }
    setSelectedItems(new Set());
  };

  const selectedTotal = cartItems
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error('Please select items to checkout');
      return;
    }
    
    // Store selected items in session storage for checkout
    const selectedCartItems = cartItems.filter(item => selectedItems.has(item.id));
    sessionStorage.setItem('checkoutItems', JSON.stringify(selectedCartItems));
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display">Your cart is empty</h2>
          <Button onClick={() => navigate('/shop')} className="bg-accent text-accent-foreground">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-6xl mx-auto">
        <h1 className="text-3xl font-display mb-8">Shopping Cart</h1>

        {/* Cart Items */}
        <Card className="mb-4">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/30">
            <div className="col-span-1 flex items-center">
              <Checkbox
                checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </div>
            <div className="col-span-5 font-semibold">Product</div>
            <div className="col-span-2 font-semibold text-center">Unit Price</div>
            <div className="col-span-2 font-semibold text-center">Quantity</div>
            <div className="col-span-2 font-semibold text-right">Total Price</div>
          </div>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 p-4 border-b items-center hover:bg-muted/20"
            >
              {/* Checkbox */}
              <div className="col-span-1">
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                />
              </div>

              {/* Product Info */}
              <div className="col-span-5 flex items-center space-x-4">
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded gold-border"
                />
                <div>
                  <h3 className="font-semibold line-clamp-2">{item.product.name}</h3>
                </div>
              </div>

              {/* Unit Price */}
              <div className="col-span-2 text-center">
                <p className="text-lg font-semibold text-accent">
                  ${item.product.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="col-span-2">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              <div className="col-span-2 text-right space-y-1">
                <p className="text-lg font-bold text-accent">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </Card>

        {/* Actions Bar */}
        <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={selectedItems.size === cartItems.length && cartItems.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="font-semibold">Select All ({cartItems.length})</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedItems.size === 0}
            >
              Delete Selected
            </Button>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total ({selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}):
              </p>
              <p className="text-3xl font-display font-bold text-accent">
                ${selectedTotal.toFixed(2)}
              </p>
            </div>
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-12"
              onClick={handleCheckout}
              disabled={selectedItems.size === 0}
            >
              Check Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
