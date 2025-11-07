import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, signOut } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full bg-[#0b0017]/95 backdrop-blur-md border-b border-gold/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Aurevia" className="h-12 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-serif text-lg transition-colors relative ${
                  isActive(item.path)
                    ? "text-gold"
                    : "text-foreground hover:text-gold"
                }`}
              >
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                    layoutId="underline"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* ✅ Seller Button (Always Visible) */}
            <Button
              onClick={() => {
                if (!user) {
                  navigate("/auth");
                } else {
                  navigate("/admin");
                }
              }}
              className="bg-gold text-[#16022d] hover:bg-gold/80 font-semibold hidden md:flex"
            >
              <Store className="h-5 w-5 mr-2" />
              Seller
            </Button>

            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5 text-gold" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="text-gold hover:text-gold/80"
                  onClick={signOut}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button
                  variant="outline"
                  className="border-gold text-gold hover:bg-gold hover:text-[#16022d]"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Cart Button */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5 text-gold" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-[#16022d] text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6 text-gold" />
              ) : (
                <Menu className="h-6 w-6 text-gold" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-[#0b0017]/95 border-t border-gold/30"
            >
              <div className="py-4 space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`block font-serif text-lg ${
                      isActive(item.path)
                        ? "text-gold"
                        : "text-foreground hover:text-gold"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}

                {/* Mobile Seller Button */}
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    if (!user) navigate("/auth");
                    else navigate("/admin");
                  }}
                  className="w-full bg-gold text-[#16022d] hover:bg-gold/80"
                >
                  <Store className="h-5 w-5 mr-2" />
                  Seller
                </Button>

                {!user ? (
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-gold text-gold"
                    >
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/profile" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full text-gold">
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full text-gold"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
