import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const categories = [
  'Men Rings', 'Men Bracelets', 'Men Necklaces', 'Men Bangles', 'Men Earrings',
  'Women Rings', 'Women Bracelets', 'Women Necklaces', 'Women Bangles', 'Women Earrings'
];

interface Product {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  category: string;
  image_url: string;
  in_stock: boolean;
}

interface EditProductModalProps {
  product: Product;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditProductModal = ({ product, open, onClose, onSuccess }: EditProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    price_usd: product.price_usd.toString(),
    category: product.category,
    in_stock: product.in_stock,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          price_usd: parseFloat(formData.price_usd),
          price: parseFloat(formData.price_usd),
        })
        .eq('id', product.id);

      if (error) throw error;

      toast.success('Product updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-gold">Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_usd}
              onChange={(e) => setFormData({ ...formData, price_usd: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="in_stock"
              checked={formData.in_stock}
              onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
            />
            <Label htmlFor="in_stock">In Stock</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gold text-primary hover:bg-gold/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
