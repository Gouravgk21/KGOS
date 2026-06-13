import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('dark'); // dark is default

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
