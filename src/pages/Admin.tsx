import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, Package } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "Accessories",
  });

  const accessoryCategories = [
    "Accessories",
    "Men Bracelets",
    "Men Rings",
    "Men Necklaces",
    "Women Bracelets",
    "Women Rings",
    "Women Necklaces",
  ];

  useEffect(() => {
    if (!user) navigate("/auth");
    else fetchSellerProducts();
  }, [user]);

  const fetchSellerProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("seller_id", user?.id);

    if (error) {
      console.error(error);
      toast.error("Failed to load your products.");
    } else setProducts(data || []);
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.image_url
    ) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!accessoryCategories.includes(newProduct.category)) {
      toast.error("You can only add accessory products.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("products").insert({
      ...newProduct,
      seller_id: user?.id,
      rating: 0,
      review_count: 0,
      price: parseFloat(newProduct.price),
    });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Error adding product.");
    } else {
      toast.success("Product added successfully!");
      setNewProduct({
        name: "",
        description: "",
        price: "",
        image_url: "",
        category: "Accessories",
      });
      fetchSellerProducts(); // refresh your list
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0017] text-gold flex flex-col">
      <main className="container mx-auto px-4 py-10 flex-1">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-display">Seller Dashboard</h1>
          <Button onClick={signOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="border border-gold/20 bg-card">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="add">Add Product</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {products.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                No products yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Card
                    key={p.id}
                    className="bg-card/40 border border-gold/20 overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h3 className="text-lg font-semibold">{p.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {p.description}
                      </p>
                      <p className="text-gold font-bold">${p.price}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <div className="grid gap-4 max-w-lg mx-auto">
              <Input
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
              <Input
                placeholder="Price (USD)"
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
              <Input
                placeholder="Image URL"
                value={newProduct.image_url}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image_url: e.target.value })
                }
              />
              <Input
                placeholder="Category (e.g., Men Bracelets)"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />

              <Button
                onClick={handleAddProduct}
                className="bg-gold text-primary hover:bg-gold/80"
                disabled={loading}
              >
                <Plus className="mr-2 h-4 w-4" />
                {loading ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
