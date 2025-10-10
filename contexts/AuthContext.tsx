// contexts/AuthContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import clienteAxios from '@/lib/axios';

// Define la interfaz para los datos del usuario
interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'cliente' | 'admin';
}

// Define la interfaz para los valores que proveerá el contexto
interface AuthContextType {
  user: User | null;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

// Crea el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define el componente Provider
export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) => {
  // --- ESTADOS Y HOOKS ---
  const [user, setUser] = useState<User | null>(initialUser);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized] = useState(true); 
  const router = useRouter();

  // --- FUNCIONES DE AUTENTICACIÓN ---
  const login = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await clienteAxios.post('/auth/login', data);
      setUser(response.data);
      router.push(response.data.rol === 'admin' ? '/admin' : '/cliente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      // La API de registro devuelve el usuario y establece la cookie
      const response = await clienteAxios.post('/auth/registro', data);
      setUser(response.data.user);
      router.push('/cliente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el registro.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await clienteAxios.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (err) {
      setError('No se pudo cerrar la sesión.');
    }
  };

  // --- VALOR DEVUELTO POR EL PROVIDER ---
  // ➡️ ¡AQUÍ ESTÁ LA CLAVE! La palabra "return" es esencial.
  return (
    <AuthContext.Provider value={{ user, login, register, logout, error, isLoading, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};