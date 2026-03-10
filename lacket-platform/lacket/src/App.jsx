import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LacketWelcome() {
  const [authMode, setAuthMode] = useState('login');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = authMode === 'login' ? '/api/users/login' : '/api/users/register';
      
      const payload = authMode === 'login' 
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`${authMode === 'login' ? 'Login' : 'Registration'} successful!`);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError('Connection failed. Make sure backend is running on ' + API_URL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden relative flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="ab
# Go to blacket folder
cd ~/blacket

# Create a new React app
npx create-react-app lacket-platform/lacket

# Go into it
cd lacket-platform/lacket

# Install dependencies
npm install lucide-react

# Replace App.jsx with our polished UI
cat > src/App.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LacketWelcome() {
  const [authMode, setAuthMode] = useState('login');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const endpoint = authMode === 'login' ? '/api/users/login' : '/api/users/register';
      
      const payload = authMode === 'login' 
        ? { username: formData.username, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`${authMode === 'login' ? 'Login' : 'Registration'} successful!`);
      setFormData({ username: '', email: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError('Connection failed. Make sure backend is running on ' + API_URL);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden relative flex flex-col items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-2xl font-black text-white">L</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">Lacket</h1>
          </div>
          <p className="text-cyan-200/60 text-lg font-light tracking-wide">Next-generation gaming platform</p>
        </div>

        <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${authMode === 'login' ? 'from-cyan-500 via-blue-500 to-purple-500' : 'from-purple-500 via-pink-500 to-cyan-500'} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
            
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-slate-700/50 group-hover:border-cyan-400/30 transition-all duration-500 shadow-2xl">
              
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                  {authMode === 'login' ? 'Login' : 'Register'}
                </h2>
                <p className="text-slate-400 text-sm font-medium">
                  {authMode === 'login' 
                    ? 'Welcome back, player' 
                    : 'Join our gaming community'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mb-8">
                <div className="relative group/input">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="enter username"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:bg-slate-700/80 transition-all duration-300 font-medium"
                      required
                    />
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="relative group/input">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your email"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:bg-slate-700/80 transition-all duration-300 font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="relative group/input">
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:bg-slate-700/80 transition-all duration-300 font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <div className="relative group/input">
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/80 focus:bg-slate-700/80 transition-all duration-300 font-medium"
                        required
                      />
                    </div>
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer transition-colors">
                      <input type="checkbox" className="w-4 h-4 rounded bg-slate-700/50 border-slate-600/50 cursor-pointer" />
                      <span>Remember me</span>
                    </label>
                    <a href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                      Forgot password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-black text-white transition-all duration-300 flex items-center justify-center gap-2 mt-8 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${
                    authMode === 'login'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⚡</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      {authMode === 'login' ? 'Login' : 'Create Account'}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">or</span>
                </div>
              </div>

              <p className="text-center text-slate-400 text-sm">
                {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                >
                  {authMode === 'login' ? 'Register' : 'Login'}
                </button>
              </p>
            </div>
          </div>
        </div>

        <p className={`text-center text-slate-500 text-xs mt-8 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          © 2026 Lacket. All rights reserved.
        </p>
      </div>
    </div>
  );
}
