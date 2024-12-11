'use client';

import { createContext, useContext, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <AuthContext.Provider value={{ openLogin, openRegister }}>
      {children}

      <Modal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        title="Welcome back"
      >
        <LoginForm onSuccess={() => setIsLoginOpen(false)} onRegister={openRegister} />
      </Modal>

      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Create an account"
      >
        <RegisterForm onSuccess={() => setIsRegisterOpen(false)} onLogin={openLogin} />
      </Modal>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 