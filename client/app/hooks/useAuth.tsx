import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, type User, type LoginCredentials, type RegisterData, type UpdateProfileData, type ChangePasswordData } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Initialize auth headers
        authApi.initializeAuth();
        
        // Get stored user
        const storedUser = authApi.getCurrentUser();
        if (storedUser && authApi.isAuthenticated()) {
          // Verify token is still valid
          try {
            const verified = await authApi.verifyToken();
            setUser(verified.user);
          } catch (error) {
            // Token is invalid, clear auth state
            authApi.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authApi.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Login error:', error);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      console.error('Register error:', error);
      throw error;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (profile) => {
      const updatedUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      };
      setUser(updatedUser);
    },
    onError: (error) => {
      console.error('Update profile error:', error);
      throw error;
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onError: (error) => {
      console.error('Change password error:', error);
      throw error;
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const register = async (userData: RegisterData) => {
    await registerMutation.mutateAsync(userData);
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    queryClient.clear();
  };

  const updateProfile = async (data: UpdateProfileData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const changePassword = async (data: ChangePasswordData) => {
    await changePasswordMutation.mutateAsync(data);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for getting user profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: authApi.isAuthenticated(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for admin users list
export function useUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => authApi.getUsers(params),
    enabled: authApi.isAdmin(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for updating user status (admin)
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      authApi.updateUserStatus(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// Hook for updating user role (admin)
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'ADMIN' | 'USER' }) =>
      authApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}