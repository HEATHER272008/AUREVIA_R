import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { useCurrency } from '@/hooks/useCurrency';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package } from 'lucide-react';
import { EditProductModal } from './EditProductModal';

interface Product {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  category: string;
  image_url: string;
  seller_id: string | null;
  rating: number | null;
  review_count: number | null;
  in_stock: boolean;
  created_at?: string;
  price?: number;
}

export const ProductManagement = () => {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      let query = supabase.from('products').select('*');
      
      // Sellers only see their own products, admins see all
      if (!isAdmin && user) {
        query = query.eq('seller_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map data to include in_stock field (default to true if missing)
      const mappedProducts = (data || []).map(p => ({
        ...p,
        in_stock: (p as any).in_stock ?? true
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading products...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-gold/20 rounded-lg">
        <Package className="mx-auto h-12 w-12 text-gold/50 mb-4" />
        <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border border-gold/20 rounded-lg overflow-hidden bg-card/50 hover:border-gold/40 transition-colors"
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-display text-lg text-gold">{product.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gold">{formatPrice(product.price_usd)}</span>
                <span className={`text-sm ${product.in_stock ? 'text-green-500' : 'text-destructive'}`}>
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setEditingProduct(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            setEditingProduct(null);
            fetchProducts();
          }}
        />
      )}
    </>
  );
};
