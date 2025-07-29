import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, ArrowLeft, FileText, Users, Archive } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { Route } from './+types/login';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sign In - The Chaim Herzog Museum" },
    { name: "description", content: "Sign in to access the Chaim Herzog Museum digital archive of Jewish soldiers in World War II." },
  ];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path or default to home
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                <img 
                  src="/icon.jpg" 
                  alt="Chaim Herzog Museum Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold">Chaim Herzog Museum</h1>
                <p className="text-blue-100">Jewish Soldier in World War II</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Preserving History,<br />
              <span className="text-blue-200">Honoring Heroes</span>
            </h2>
            
            <p className="text-lg text-blue-100 mb-8 leading-relaxed">
              Access our comprehensive digital archive documenting the 1.5 million Jewish soldiers who served in Allied forces, Partisans, and resistance movements during World War II.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <FileText className="w-5 h-5 mr-3 text-blue-200" />
                <span>Historical documents and testimonies</span>
              </div>
              <div className="flex items-center text-blue-100">
                <Users className="w-5 h-5 mr-3 text-blue-200" />
                <span>Stories of heroism and resistance</span>
              </div>
              <div className="flex items-center text-blue-100">
                <Archive className="w-5 h-5 mr-3 text-blue-200" />
                <span>AI-powered document analysis</span>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <p className="text-sm text-gray-800 font-medium leading-relaxed">
                "Honoring the 1,500,000 Jewish soldiers who served and the 250,000 who gave their lives fighting against Nazi tyranny."
              </p>
              <p className="text-xs text-gray-600 mt-2 font-medium">— Museum Mission</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </div>

          <div>
            <div className="lg:hidden mb-8">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <img 
                    src="/icon.jpg" 
                    alt="Museum Logo" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Chaim Herzog Museum</h1>
                  <p className="text-sm text-gray-600">Jewish Soldier in WWII</p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600 mb-8">
              Sign in to access the archive or{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                create a new account
              </Link>
            </p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600 mb-4">Demo Accounts</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Admin Access</p>
                      <p className="text-sm text-gray-600 mt-1">admin@example.com</p>
                      <p className="text-sm text-gray-600">admin123</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Full Access
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">User Access</p>
                      <p className="text-sm text-gray-600 mt-1">user@example.com</p>
                      <p className="text-sm text-gray-600">user123</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Read Only
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}