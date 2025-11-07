import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const Seller = () => {
  const [products, setProducts] = useState(() => {
    const stored = localStorage.getItem("seller_products");
    return stored ? JSON.parse(stored) : [];
  });

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Accessories",
    description: "",
    image: "",
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
      toast.error("Please fill out all fields.");
      return;
    }

    // Restrict to accessories only
    const validCategories = [
      "Bracelets",
      "Necklaces",
      "Earrings",
      "Rings",
      "Watches",
      "Accessories",
    ];

    if (!validCategories.includes(newProduct.category)) {
      toast.error("You can only add accessory products.");
      return;
    }

    const updatedProducts = [
      ...products,
      { ...newProduct, id: Date.now().toString() },
    ];
    setProducts(updatedProducts);
    localStorage.setItem("seller_products", JSON.stringify(updatedProducts));

    toast.success("Product added successfully!");
    setNewProduct({
      name: "",
      price: "",
      category: "Accessories",
      description: "",
      image: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0017] text-gold px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        <h1 className="text-4xl font-display text-center mb-4">
          Seller Dashboard
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Manage and add your accessory products below.
        </p>

        <Card className="bg-card/30 border border-gold/20">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-display text-gold">Add New Product</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price ($)"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: e.target.value })
                }
              />
              <Input
                placeholder="Category (e.g. Bracelets)"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
              <Input
                placeholder="Image URL"
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
              />
            </div>

            <textarea
              placeholder="Description"
              className="w-full bg-transparent border border-gold/20 rounded-lg p-3 text-sm"
              value={newProduct.description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, description: e.target.value })
              }
            />

            <Button
              className="bg-gold text-primary hover:bg-gold/90"
              onClick={handleAddProduct}
            >
              Add Product
            </Button>
          </CardContent>
        </Card>

        {/* Product List */}
        <div>
          <h2 className="text-2xl font-display mb-4 text-gold">
            Your Products
          </h2>
          {products.length === 0 ? (
            <p className="text-muted-foreground">No products added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="border border-gold/20 bg-card/30"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {product.category}
                    </p>
                    <p className="text-gold font-bold">${product.price}</p>
                    <p className="text-sm mt-2">{product.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Seller;
