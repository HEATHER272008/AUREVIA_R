import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, Upload } from 'lucide-react';

const categories = [
  'Men Rings', 'Men Bracelets', 'Men Necklaces', 'Men Bangles', 'Men Earrings',
  'Women Rings', 'Women Bracelets', 'Women Necklaces', 'Women Bangles', 'Women Earrings'
];

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddProductModal = ({ open, onClose }: AddProductModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [validatingImage, setValidatingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_usd: '',
    category: '',
    in_stock: true,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidatingImage(true);
    try {
      // Read as data URL for preview AND validation
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setImagePreview(dataUrl);

      // Validate image is an accessory using base64 data URL (accessible to edge fn)
      const { data, error } = await supabase.functions.invoke('validate-accessory-image', {
        body: { imageUrl: dataUrl }
      });

      if (error) throw error;

      if (!data?.isAccessory) {
        toast.error('The product image does not match an accessory item. Please upload an accessory product.');
        setImageFile(null);
        setImagePreview('');
        e.target.value = '';
        return;
      }

      setImageFile(file);
      toast.success('Image validated successfully');
    } catch (error) {
      console.error('Error validating image:', error);
      toast.error('Failed to validate image. Please try again.');
      setImageFile(null);
      setImagePreview('');
      e.target.value = '';
    } finally {
      setValidatingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !imageFile) return;

    setLoading(true);
    try {
      // Upload image
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // Create product
      const { error: insertError } = await supabase
        .from('products')
        .insert({
          ...formData,
          price_usd: parseFloat(formData.price_usd),
          price: parseFloat(formData.price_usd),
          image_url: publicUrl,
          seller_id: user.id,
          rating: 5,
          review_count: 0,
        });

      if (insertError) throw insertError;

      toast.success('Product added successfully');
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price_usd: '',
        category: '',
        in_stock: true,
      });
      setImageFile(null);
      setImagePreview('');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-gold/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-gold">Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="image">Product Image *</Label>
            <div className="mt-2 flex items-center gap-4">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gold/20" />
              )}
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={validatingImage || loading}
                  required
                />
                {validatingImage && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating image...
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Elegant Gold Bracelet"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
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
              placeholder="299.99"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Elegant gold bracelet with intricate design..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gold text-primary hover:bg-gold/90" disabled={loading || validatingImage || !imageFile}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
