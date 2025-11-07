import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface PreloaderProps {
  onLoadingComplete: () => void;
}

const Preloader = ({ onLoadingComplete }: PreloaderProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(onLoadingComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main logo with star-like shine animation */}
        <motion.div
          className="absolute inset-0"
          animate={{
            filter: [
              'brightness(1) drop-shadow(0 0 20px hsl(var(--accent) / 0.6))',
              'brightness(1.5) drop-shadow(0 0 60px hsl(var(--accent) / 1))',
              'brightness(1) drop-shadow(0 0 20px hsl(var(--accent) / 0.6))',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/logo.png"
            alt="Aurevia Logo"
            className="w-full h-full object-contain"
          />
        </motion.div>

        {/* Additional radiant glow effect */}
        <motion.div
          className="absolute inset-0 blur-xl"
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-full h-full bg-accent/30 rounded-full" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
