import { useState, useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes.tsx';
import Splash from './components/Splash';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LanguageProvider>
      {showSplash ? (
        <Splash />
      ) : (
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      )}
    </LanguageProvider>
  );
}
