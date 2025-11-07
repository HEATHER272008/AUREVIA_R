import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { SUPPORTED_CURRENCIES, CurrencyCode } from '@/hooks/useCurrency';
import { Loader2 } from 'lucide-react';

const authSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  fullName: z.string().trim().min(1).max(100).optional(),
});

interface Country {
  name: { common: string };
  cca2: string;
  currencies: { [key: string]: { name: string; symbol: string } };
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('US');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [countries, setCountries] = useState<{ code: string; name: string; currency: CurrencyCode }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,currencies');
        const data: Country[] = await response.json();
        
        const currencyMap: { [key: string]: CurrencyCode } = {
          USD: 'USD',
          PHP: 'PHP',
          JPY: 'JPY',
          CAD: 'CAD',
          EUR: 'EUR',
        };

        const mappedCountries = data
          .map(country => {
            const currencyCode = Object.keys(country.currencies || {})[0];
            const supportedCurrency = currencyMap[currencyCode];
            
            return {
              code: country.cca2,
              name: country.name.common,
              currency: supportedCurrency || 'USD' as CurrencyCode,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(mappedCountries);
      } catch (error) {
        console.error('Error fetching countries:', error);
        setCountries([
          { code: 'US', name: 'United States', currency: 'USD' },
          { code: 'PH', name: 'Philippines', currency: 'PHP' },
          { code: 'JP', name: 'Japan', currency: 'JPY' },
          { code: 'CA', name: 'Canada', currency: 'CAD' },
          { code: 'FR', name: 'France', currency: 'EUR' },
        ]);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = authSchema.safeParse({ email, password, fullName });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName },
          },
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            throw error;
          }
          setIsLoading(false);
          return;
        }

        // ✅ Automatically assign "seller" role for new users
        if (data.user) {
          await supabase
            .from('profiles')
            .update({
              country,
              currency_preference: currency,
              role: 'seller', // 👈 Auto seller role here
            })
            .eq('id', data.user.id);
        }

        toast.success('Account created successfully! You can now access the Seller Dashboard.');
        navigate('/admin'); // 👈 Redirect directly to Seller page
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            throw error;
          }
          setIsLoading(false);
          return;
        }
        toast.success('Welcome back to Aurevia!');
        navigate('/');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/10 to-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="gold-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-display text-center text-gold">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="bg-background/50 border-muted focus:border-gold"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="text-foreground">Country</Label>
                    {isLoadingCountries ? (
                      <div className="flex items-center justify-center py-3 border border-muted rounded-md bg-background/50">
                        <Loader2 className="h-4 w-4 animate-spin text-gold" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading countries...</span>
                      </div>
                    ) : (
                      <Select
                        value={country}
                        onValueChange={(value) => {
                          setCountry(value);
                          const selectedCountry = countries.find(c => c.code === value);
                          if (selectedCountry) setCurrency(selectedCountry.currency);
                        }}
                      >
                        <SelectTrigger id="country" className="bg-background/50 border-muted focus:border-gold">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-gold/20 max-h-[300px]">
                          {countries.map((c) => (
                            <SelectItem 
                              key={c.code} 
                              value={c.code}
                              className="focus:bg-primary/20 focus:text-gold"
                            >
                              {c.name} ({SUPPORTED_CURRENCIES[c.currency].symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-background/50 border-muted focus:border-gold"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-background/50 border-muted focus:border-gold"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 button-shine gold-glow"
                disabled={isLoading || (isSignUp && isLoadingCountries)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Sign Up' : 'Sign In'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-gold hover:text-gold-light transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
