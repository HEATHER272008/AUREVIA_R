import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  PHP: { symbol: '₱', name: 'Philippine Peso' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

interface ExchangeRates {
  [key: string]: number;
}

export const useCurrency = () => {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [rates, setRates] = useState<ExchangeRates>({ USD: 1 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user's currency preference
    const fetchUserCurrency = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('currency_preference')
          .eq('id', user.id)
          .single();

        if (data?.currency_preference) {
          setCurrency(data.currency_preference as CurrencyCode);
        }
      }
    };

    // Fetch exchange rates
    const fetchRates = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-exchange-rates');
        if (error) throw error;
        setRates(data.rates);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserCurrency();
    fetchRates();

    // Refresh rates every hour
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  const convert = (priceUSD: number): number => {
    return priceUSD * (rates[currency] || 1);
  };

  const formatPrice = (priceUSD: number): string => {
    const converted = convert(priceUSD);
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    
    if (currency === 'JPY') {
      return `${currencyInfo.symbol}${Math.round(converted).toLocaleString()}`;
    }
    
    return `${currencyInfo.symbol}${converted.toFixed(2)}`;
  };

  return { currency, setCurrency, convert, formatPrice, rates, isLoading };
};
